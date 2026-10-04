/**
 * FlowAffiliate — server lokal + proxy AI.
 *
 * Tugasnya dua:
 *   1. Menyajikan berkas statis aplikasi (tanpa build step, tanpa dependensi).
 *   2. Menjadi PROXY ke gateway AI untuk analisis gambar dan penulisan narasi.
 *
 * KENAPA HARUS PROXY, BUKAN DIPANGGIL LANGSUNG DARI BROWSER:
 *   - Gateway AI umumnya tidak mengirim header CORS, jadi `fetch` dari halaman
 *     akan diblokir browser.
 *   - Kalau aplikasi dibuka lewat `file://`, origin-nya `null` dan hampir semua
 *     gateway menolaknya.
 *   - Menaruh API key di browser berarti key ikut terkirim ke setiap pengguna
 *     dan tersimpan di localStorage. Dengan proxy, key TIDAK PERNAH meninggalkan
 *     mesin ini — browser hanya bicara ke localhost.
 *
 * Konfigurasi lewat `.env` (Bun memuatnya otomatis):
 *   AI_BASE_URL       contoh: https://gateway.example.com/v1
 *   AI_API_KEY        API key gateway
 *   AI_VISION_MODEL   default: glm-5.3-flash   (model yang bisa membaca gambar)
 *   AI_TEXT_MODEL     default: mimo-v2.5-pro   (untuk menulis ulang narasi)
 *   AI_MOCK=1         mode uji: balas analisis contoh tanpa memanggil jaringan
 *
 * Jalankan:  bun run server.ts
 * Lalu buka: http://localhost:3000
 */

import { join, normalize, extname } from "node:path";

const ROOT = import.meta.dir;
const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "localhost";

/* ═══════════════════════════ Konfigurasi AI ═══════════════════════════ */

const AI_BASE_URL = (process.env.AI_BASE_URL ?? "").replace(/\/+$/, "");
const AI_API_KEY = process.env.AI_API_KEY ?? "";
const AI_VISION_MODEL = process.env.AI_VISION_MODEL ?? "glm-5.3-flash";
const AI_TEXT_MODEL = process.env.AI_TEXT_MODEL ?? "mimo-v2.5-pro";
const AI_MOCK = process.env.AI_MOCK === "1";
const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS ?? 60000);

/**
 * Daftar model vision yang BOLEH diminta browser.
 *
 * Browser boleh memilih model (supaya bisa menukar kualitas vs biaya tanpa
 * mengedit .env dan restart), tapi TIDAK boleh menentukan model sembarangan:
 * tanpa allowlist ini, klien bisa menyuruh server memanggil model apa pun
 * yang ada di gateway. Kalau AI_VISION_MODELS tidak diisi, hanya model
 * default yang diizinkan.
 */
const AI_VISION_MODELS: string[] = (() => {
  const fromEnv = (process.env.AI_VISION_MODELS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return fromEnv.length ? fromEnv : [AI_VISION_MODEL];
})();

/** Pilih model yang diminta bila diizinkan, jika tidak pakai default. */
function resolveVisionModel(requested: unknown): string {
  const want = typeof requested === "string" ? requested.trim() : "";
  if (want && AI_VISION_MODELS.includes(want)) return want;
  return AI_VISION_MODEL;
}

/** Nama host saja — jangan pernah bocorkan key atau URL lengkap ke browser. */
function hostOf(u: string): string {
  try {
    return new URL(u).host;
  } catch {
    return u ? "(URL tidak valid)" : "";
  }
}

const aiConfigured = () => Boolean(AI_BASE_URL && AI_API_KEY);

/* ═══════════════════════════ Prompt analisis ══════════════════════════ */

/**
 * Instruksi untuk model vision. Keluarannya langsung dipakai Conductor Engine,
 * jadi field-nya sengaja dibuat operasional — bukan deskripsi bebas.
 *
 * `productDescription` adalah yang paling berdampak: tanpa itu prompt video
 * hanya berkata "the product", sehingga model Flow harus menebak bentuk produk.
 */
const VISION_SYSTEM_PROMPT = `Kamu analis produk untuk pembuatan video iklan affiliate di Indonesia.

Kamu menerima satu atau beberapa foto produk. Analisis dan balas HANYA dengan JSON valid tanpa markdown.

Field yang wajib ada:
{
  "productName": "nama produk jika terbaca dari label/packaging, jika tidak terbaca isi tebakan singkat",
  "category": "pilih TEPAT SATU: SKINCARE | FASHION | FNB | GADGET | HOME | HEALTH | UNIVERSAL",
  "confidence": 0.0,
  "productDescription": "deskripsi visual produk dalam BAHASA INGGRIS, 1-2 kalimat, sebutkan bentuk kemasan, warna, material, dan finishing. Ini dipakai model video untuk mengenali produk, jadi harus konkret.",
  "labelText": "tulisan yang benar-benar terlihat pada kemasan, apa adanya. Kosongkan jika tidak ada.",
  "packaging": { "type": "", "color": "", "material": "", "finish": "" },
  "dominantColors": ["#RRGGBB"],
  "visualMood": "frasa BAHASA INGGRIS, misal: clean and premium, bright and playful",
  "suggestedSetting": "lokasi syuting dalam BAHASA INGGRIS yang cocok dengan produk ini, 1 frasa",
  "suggestedLighting": "gaya pencahayaan dalam BAHASA INGGRIS, 1 frasa",
  "suggestedWardrobe": "pakaian talent dalam BAHASA INGGRIS, 1 frasa",
  "suggestedPains": ["3 masalah pembeli dalam BAHASA INDONESIA, singkat, natural"],
  "suggestedBenefits": ["3 manfaat dalam BAHASA INDONESIA, singkat, tanpa klaim berlebihan"],
  "suggestedAudience": "target pembeli dalam BAHASA INDONESIA, singkat",
  "usageHint": "cara pakai produk dalam BAHASA INDONESIA, singkat"
}

Aturan:
- Jangan mengarang klaim kesehatan. Jangan menyebut harga. Jangan menyebut angka statistik.
- Kalau tulisan pada kemasan tidak terbaca, kosongkan labelText. JANGAN mengarang merek.
- productName dan productDescription pakai BAHASA INGGRIS kecuali nama merek aslinya.`;

/** Instruksi untuk menulis ulang narasi (dipakai bila mode AI enrichment aktif). */
function buildEnrichPrompt(
  productName: string,
  category: string,
  pains: string[],
  benefits: string[],
  scenes: { index: number; duration: number; current: string }[],
): string {
  const lines = scenes.map(
    (s) =>
      `Scene ${s.index} (maks ${Math.max(4, Math.floor(s.duration * 2.5))} kata): ` +
      `sekarang "${s.current}"`,
  );

  return [
    "Kamu copywriter iklan affiliate Indonesia yang spesialis hook viral TikTok/Shopee.",
    "",
    `PRODUK: ${productName}`,
    `KATEGORI: ${category}`,
    `MASALAH TARGET: ${pains.join(", ")}`,
    `MANFAAT UTAMA: ${benefits.join(", ")}`,
    "",
    "TUGAS: tulis ulang dialog tiap scene agar lebih natural, spesifik, dan menggugah.",
    "Bahasa Indonesia sehari-hari tapi sopan. JANGAN mengarang klaim kesehatan atau angka.",
    "JANGAN menyebut harga. Teks layar maksimal 5 kata.",
    "",
    "BATAS KATA PER SCENE (WAJIB DIPATUHI):",
    lines.join("\n"),
    "",
    "Balas HANYA JSON valid tanpa markdown:",
    '{"scenes":[{"index":1,"dialogue":"...","onscreen":"..."}]}',
  ].join("\n");
}

/* ═════════════════════════ Pemanggil gateway ══════════════════════════ */

type ChatMessage = { role: string; content: unknown };

/** Panggil endpoint chat completions yang kompatibel dengan OpenAI. */
async function callGateway(
  model: string,
  messages: ChatMessage[],
  jsonMode: boolean,
): Promise<{ text: string; usage: unknown }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), AI_TIMEOUT_MS);

  try {
    const res = await fetch(`${AI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: jsonMode ? 0.2 : 0.85,
        max_tokens: jsonMode ? 2048 : 1600,
        ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: ctrl.signal,
    });

    const raw = await res.text();

    if (!res.ok) {
      // Teruskan pesan asli gateway — jauh lebih berguna daripada "gagal".
      throw new Error(`gateway HTTP ${res.status}: ${raw.slice(0, 400)}`);
    }

    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error(`respons gateway bukan JSON: ${raw.slice(0, 200)}`);
    }

    const text: string =
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.text ??
      "";

    if (!text) throw new Error("gateway tidak mengembalikan konten");

    return { text, usage: data?.usage ?? null };
  } finally {
    clearTimeout(timer);
  }
}

/** Ambil objek JSON dari teks yang mungkin terbungkus pagar markdown. */
function extractJson(text: string): any {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    /* lanjut ke pembersihan */
  }
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) {
    try {
      return JSON.parse(fenced[1]);
    } catch {
      /* lanjut */
    }
  }
  const braced = trimmed.match(/\{[\s\S]*\}/);
  if (braced) return JSON.parse(braced[0]);
  throw new Error("tidak menemukan JSON pada respons model");
}

/* ═══════════════════════ Analisis mode uji (mock) ═════════════════════ */

const MOCK_ANALYSIS = {
  productName: "Glow Serum Vitamin C",
  category: "SKINCARE",
  confidence: 0.86,
  productDescription:
    "a small frosted glass dropper bottle with a brushed gold cap and a minimal white label, containing a clear serum",
  labelText: "GLOW SERUM",
  packaging: {
    type: "dropper bottle",
    color: "frosted white with gold cap",
    material: "glass and metal",
    finish: "matte label, glossy glass",
  },
  dominantColors: ["#F5F0E8", "#C9A961", "#FFFFFF"],
  visualMood: "clean, premium and calm",
  suggestedSetting: "a bright minimalist bathroom counter with soft marble texture",
  suggestedLighting: "soft diffused morning light from camera-left",
  suggestedWardrobe: "a soft cream linen shirt",
  suggestedPains: [
    "kulit kusam dan nggak cerah",
    "minyak berlebih di siang hari",
    "bekas jerawat yang susah hilang",
  ],
  suggestedBenefits: [
    "kulit tampak lebih cerah",
    "minyak berlebih lebih terkontrol",
    "kulit terasa lebih lembap",
  ],
  suggestedAudience: "wanita 20-30 tahun pekerja kantoran",
  usageHint: "teteskan 3 tetes lalu tepuk lembut ke seluruh wajah",
  mock: true,
};

/* ═════════════════════════════ Handler API ════════════════════════════ */

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

/** GET /api/status — dipakai UI untuk menampilkan kesiapan AI. */
function handleStatus(): Response {
  return json({
    ok: true,
    vision: {
      configured: aiConfigured() || AI_MOCK,
      mock: AI_MOCK,
      model: AI_VISION_MODEL,
      models: AI_VISION_MODELS,
      baseUrlHost: hostOf(AI_BASE_URL),
      reason: AI_MOCK
        ? "Mode uji aktif (AI_MOCK=1)."
        : aiConfigured()
          ? null
          : "AI_BASE_URL atau AI_API_KEY belum diisi di .env",
    },
    text: { model: AI_TEXT_MODEL },
  });
}

/** POST /api/vision — analisis gambar produk. */
async function handleVision(req: Request): Promise<Response> {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Body harus JSON." }, 400);
  }

  const images: string[] = Array.isArray(body?.images) ? body.images : [];
  if (!images.length) return json({ error: "Tidak ada gambar yang dikirim." }, 400);
  if (images.length > 5) return json({ error: "Maksimal 5 gambar." }, 400);

  // Hanya terima data URL gambar — tolak URL http agar server ini tidak bisa
  // dipakai sebagai proxy terbuka (SSRF) untuk memanggil alamat sembarangan.
  for (const img of images) {
    if (typeof img !== "string" || !/^data:image\/(png|jpe?g|webp|gif);base64,/.test(img)) {
      return json({ error: "Gambar harus berupa data URL image/*." }, 400);
    }
  }

  if (AI_MOCK) return json({ analysis: MOCK_ANALYSIS, usage: null, model: "mock" });

  if (!aiConfigured()) {
    return json(
      {
        error:
          "AI belum dikonfigurasi. Isi AI_BASE_URL dan AI_API_KEY di file .env, " +
          "lalu jalankan ulang server.",
      },
      503,
    );
  }

  const userContent: unknown[] = [
    {
      type: "text",
      text:
        `Analisis ${images.length} foto produk berikut. ` +
        (body?.hint ? `Petunjuk tambahan dari pengguna: ${String(body.hint).slice(0, 300)}` : ""),
    },
    ...images.map((url) => ({ type: "image_url", image_url: { url } })),
  ];

  // Model dipilih browser, tapi divalidasi terhadap allowlist.
  const model = resolveVisionModel(body?.model);

  try {
    const { text, usage } = await callGateway(
      model,
      [
        { role: "system", content: VISION_SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      true,
    );
    const analysis = extractJson(text);
    return json({ analysis, usage, model });
  } catch (err: any) {
    const msg = String(err?.message ?? err);
    const status = /abort/i.test(msg) ? 504 : 502;
    return json(
      {
        error:
          status === 504
            ? `Gateway tidak merespons dalam ${Math.round(AI_TIMEOUT_MS / 1000)} detik.`
            : `Gagal menganalisis gambar: ${msg}`,
      },
      status,
    );
  }
}

/** POST /api/enrich — tulis ulang narasi memakai model teks. */
async function handleEnrich(req: Request): Promise<Response> {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Body harus JSON." }, 400);
  }

  const scenes = Array.isArray(body?.scenes) ? body.scenes : [];
  if (!scenes.length) return json({ error: "Tidak ada scene yang dikirim." }, 400);

  if (AI_MOCK) {
    return json({
      scenes: scenes.map((s: any) => ({
        index: s.index,
        dialogue: s.current,
        onscreen: "",
      })),
      model: "mock",
    });
  }

  if (!aiConfigured()) return json({ error: "AI belum dikonfigurasi." }, 503);

  const prompt = buildEnrichPrompt(
    String(body?.productName ?? "-"),
    String(body?.category ?? "-"),
    Array.isArray(body?.pains) ? body.pains : [],
    Array.isArray(body?.benefits) ? body.benefits : [],
    scenes.map((s: any) => ({
      index: Number(s.index),
      duration: Number(s.duration) || 8,
      current: String(s.current ?? ""),
    })),
  );

  try {
    const { text } = await callGateway(
      AI_TEXT_MODEL,
      [{ role: "user", content: prompt }],
      true,
    );
    return json({ ...extractJson(text), model: AI_TEXT_MODEL });
  } catch (err: any) {
    return json({ error: `Gagal menyusun narasi: ${String(err?.message ?? err)}` }, 502);
  }
}

/* ═════════════════════════ Penyajian statis ═══════════════════════════ */

/** Halaman 404 yang aman — tidak membocorkan isi path aslinya. */
function notFoundHtml(requested: string): string {
  const safe = requested.replace(/[<>&"']/g, (ch) => `&#${ch.charCodeAt(0)};`);
  return `<!doctype html><meta charset="utf-8">
<title>404 — FlowAffiliate</title>
<body style="font-family:system-ui;background:#0e1013;color:#eef2f6;padding:40px">
<h1 style="color:#4ade80">404</h1>
<p>Berkas <code>${safe}</code> tidak ditemukan.</p>
<p><a href="/" style="color:#60a5fa">&larr; Kembali ke aplikasi</a></p>`;
}

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".ts": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".map": "application/json; charset=utf-8",
};

/** Berkas internal yang tidak boleh terservis lewat HTTP. */
const HIDDEN = /^\./;      // .git, .gitignore, .github, .env
const INTERNAL = /^_/;     // _srv-out.txt, _srv-err.txt, _srv.pid, dll.
const LOGFILE = /\.log$/i; // *.log

/**
 * Tolak path yang menunjuk ke berkas internal.
 *
 * `.gitignore` hanya melindungi GIT — ia tidak memengaruhi layer HTTP sama
 * sekali. Tanpa pemeriksaan ini, `/.env` (berisi API key) akan ikut terservis.
 */
function isBlockedPath(pathname: string): boolean {
  const segments = pathname.split(/[\\/]+/).filter(Boolean);
  return segments.some(
    (seg) => HIDDEN.test(seg) || INTERNAL.test(seg) || LOGFILE.test(seg),
  );
}

/** Cegah path traversal: hasil resolve harus tetap di dalam ROOT. */
function resolveSafe(urlPath: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return null;
  }
  const clean = decoded.split("?")[0].split("#")[0];
  if (isBlockedPath(clean)) return null;

  const target = normalize(join(ROOT, clean));
  if (target !== ROOT && !target.startsWith(ROOT + "\\") && !target.startsWith(ROOT + "/")) {
    return null;
  }
  return target;
}

/* ═════════════════════════════ Server ═════════════════════════════════ */

const server = Bun.serve({
  port: PORT,
  hostname: HOST,

  async fetch(req) {
    const url = new URL(req.url);
    let pathname = url.pathname;

    /* --- API --- */
    if (pathname.startsWith("/api/")) {
      if (pathname === "/api/status" && req.method === "GET") return handleStatus();
      if (pathname === "/api/vision" && req.method === "POST") return handleVision(req);
      if (pathname === "/api/enrich" && req.method === "POST") return handleEnrich(req);
      return json({ error: `Rute API tidak dikenal: ${pathname}` }, 404);
    }

    /* --- Rute nyaman --- */
    if (pathname === "/demo" || pathname === "/demo/") {
      return Response.redirect(new URL("/index.html?demo=1", url).toString(), 302);
    }
    if (pathname === "/test" || pathname === "/test/") {
      return Response.redirect(new URL("/test-suite.html", url).toString(), 302);
    }
    if (pathname === "/") pathname = "/index.html";

    /* --- Berkas statis --- */
    const filePath = resolveSafe(pathname);
    if (!filePath) {
      return new Response(notFoundHtml(pathname), {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const file = Bun.file(filePath);
    if (!(await file.exists())) {
      return new Response(notFoundHtml(pathname), {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const ext = extname(filePath).toLowerCase();
    const headers: Record<string, string> = {
      "Content-Type": MIME[ext] ?? "application/octet-stream",
      "Cache-Control": "no-cache",
    };
    if (ext === ".html") headers["Cache-Control"] = "no-store";

    return new Response(file, { headers });
  },

  error(err) {
    console.error("[FlowAffiliate] server error:", err);
    return new Response("500 Internal Server Error", { status: 500 });
  },
});

/* ═════════════════════════════ Banner ═════════════════════════════════ */

const aiLine = AI_MOCK
  ? "AKTIF (mode uji, tanpa jaringan)"
  : aiConfigured()
    ? `siap — vision: ${AI_VISION_MODEL} @ ${hostOf(AI_BASE_URL)}`
    : "belum dikonfigurasi (isi .env)";

console.log("");
console.log("  FlowAffiliate — server lokal berjalan");
console.log("  ────────────────────────────────────────");
console.log(`  Aplikasi   :  http://${HOST}:${PORT}/`);
console.log(`  Demo       :  http://${HOST}:${PORT}/demo`);
console.log(`  Test suite :  http://${HOST}:${PORT}/test`);
console.log(`  Analisis AI:  ${aiLine}`);
console.log("");
console.log("  Tekan Ctrl+C untuk berhenti.");
console.log("");
