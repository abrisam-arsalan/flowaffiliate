/**
 * FlowAffiliate — server lokal + proxy AI + pengelolaan profil API.
 *
 * Tugasnya tiga:
 *   1. Menyajikan berkas statis aplikasi (tanpa build step, tanpa dependensi).
 *   2. Menjadi PROXY ke gateway AI untuk analisis gambar dan penulisan narasi.
 *   3. Menyimpan beberapa profil API yang bisa diatur dari halaman Pengaturan.
 *
 * KENAPA HARUS PROXY, BUKAN DIPANGGIL LANGSUNG DARI BROWSER:
 *   - Gateway AI umumnya tidak mengirim header CORS, jadi `fetch` dari halaman
 *     akan diblokir browser.
 *   - Kalau aplikasi dibuka lewat `file://`, origin-nya `null` dan hampir semua
 *     gateway menolaknya.
 *   - API key disimpan di server, bukan di browser. Key hanya melintas sekali
 *     saat Anda klik Simpan, lalu tetap di mesin ini — tidak ikut terkirim pada
 *     setiap permintaan dan tidak bisa dicuri lewat XSS.
 *
 * Konfigurasi dibaca ULANG setiap permintaan (lihat resolveConfig), sehingga
 * menyimpan profil di UI langsung berlaku tanpa menjalankan ulang server.
 *
 * Jalankan:  bun run server.ts
 * Lalu buka: http://localhost:3000
 */

import { join, normalize, extname } from "node:path";
import {
  listProfiles,
  upsertProfile,
  removeProfile,
  setActive,
  getProfile,
  recordTest,
  resolveConfig,
  isMock,
  normalizeBaseUrl,
  SUGGESTED_VISION_MODELS,
  type EffectiveConfig,
} from "./ai-profiles";

const ROOT = import.meta.dir;
const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "localhost";

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
  "productDescription": "deskripsi visual produk dalam BAHASA INGGRIS, 1-2 kalimat, WAJIB diisi: sebutkan bentuk kemasan (botol/jar/tube/pouch/kaleng), jenis tutup, warna, material, dan finishing. Ini dipakai model video untuk mengenali produk, jadi harus konkret dan hanya boleh menyebut hal yang benar-benar terlihat pada foto.",
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
- productDescription jangan pernah dikosongkan. Deskripsikan hanya yang terlihat pada foto — jangan mengarang bentuk kemasan yang tidak ada.
- Kalau menerima lebih dari satu foto, anggap semuanya SATU produk yang sama dari sudut berbeda, dan gabungkan yang terlihat dari semuanya.
- productName dan productDescription pakai BAHASA INGGRIS kecuali nama merek aslinya.`;

/** Instruksi untuk menulis ulang narasi. */
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

/**
 * Panggil endpoint chat completions yang kompatibel dengan OpenAI.
 * Konfigurasi diberikan sebagai parameter karena bisa berubah kapan saja.
 */
async function callGateway(
  cfg: { baseUrl: string; apiKey: string; timeoutMs: number },
  model: string,
  messages: ChatMessage[],
  jsonMode: boolean,
): Promise<{ text: string; usage: unknown }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), cfg.timeoutMs || 60000);

  try {
    const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.apiKey}`,
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
      throw new Error(`gateway HTTP ${res.status}: ${raw.slice(0, 400)}`);
    }

    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error(`respons gateway bukan JSON: ${raw.slice(0, 200)}`);
    }

    const text: string =
      data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? "";

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

/* ═════════════════════════════ Utilitas HTTP ══════════════════════════ */

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

async function readJson(req: Request): Promise<any | null> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

/** Nama host saja — jangan pernah bocorkan key atau URL lengkap ke browser. */
function hostOf(u: string): string {
  try {
    return new URL(u).host;
  } catch {
    return u ? "(URL tidak valid)" : "";
  }
}

/** PNG 1x1 untuk menguji apakah model benar-benar bisa membaca gambar. */
const TINY_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==";

/* ═════════════════════════ Handler API ════════════════════════════════ */

/** GET /api/status — kesiapan AI + ringkasan profil aktif. */
function handleStatus(): Response {
  const cfg = resolveConfig();
  const { profiles, activeId } = listProfiles();
  const mock = isMock();

  const configured = cfg.source !== "none" || mock;

  return json({
    ok: true,
    vision: {
      configured,
      mock,
      model: cfg.visionModel,
      models: cfg.visionModels.length ? cfg.visionModels : [cfg.visionModel],
      baseUrlHost: hostOf(cfg.baseUrl),
      // `source` melaporkan ASAL konfigurasi yang sebenarnya (profil atau .env),
      // terpisah dari flag `mock`. Kalau digabung, UI kehilangan informasi
      // dari mana konfigurasi berasal saat mode uji aktif.
      source: cfg.source,
      mockOverrides: mock && cfg.source !== "none",
      profileId: cfg.profileId ?? null,
      profileName: cfg.profileName ?? null,
      reason: mock
        ? "Mode uji aktif (AI_MOCK=1): analisis memakai contoh tanpa memanggil jaringan."
        : cfg.source === "none"
          ? "Belum ada profil API yang aktif. Tambahkan di halaman Pengaturan."
          : null,
    },
    text: { model: cfg.textModel },
    profiles: { count: profiles.length, activeId },
    suggestedModels: SUGGESTED_VISION_MODELS,
  });
}

/** GET /api/profiles — daftar profil (key disamarkan). */
function handleListProfiles(): Response {
  const data = listProfiles();
  const cfg = resolveConfig();
  return json({
    ok: true,
    ...data,
    effective: {
      // Sama seperti /api/status: `source` melaporkan asal konfigurasi yang
      // sebenarnya, dan `mock` berdiri sendiri. Kalau digabung, UI kehilangan
      // informasi asal konfigurasi dan menampilkan pesan yang salah.
      source: cfg.source,
      mock: isMock(),
      profileId: cfg.profileId ?? null,
      profileName: cfg.profileName ?? null,
      model: cfg.visionModel,
      textModel: cfg.textModel,
      baseUrlHost: hostOf(cfg.baseUrl),
    },
    suggestedModels: SUGGESTED_VISION_MODELS,
  });
}

/** POST /api/profiles — tambah atau ubah profil. */
async function handleSaveProfile(req: Request): Promise<Response> {
  const body = await readJson(req);
  if (!body) return json({ ok: false, error: "Body harus JSON." }, 400);
  const r = upsertProfile(body);
  if (!r.ok) return json({ ok: false, error: r.error }, 400);
  // Langsung aktifkan bila ini profil pertama.
  const { activeId } = listProfiles();
  return json({ ok: true, profile: r.profile, activeId });
}

/** DELETE /api/profiles?id=... */
function handleDeleteProfile(url: URL): Response {
  const id = url.searchParams.get("id") ?? "";
  if (!id) return json({ ok: false, error: "Parameter id wajib." }, 400);
  const ok = removeProfile(id);
  if (!ok) return json({ ok: false, error: "Profil tidak ditemukan." }, 404);
  return json({ ok: true, ...listProfiles() });
}

/** POST /api/profiles/activate — jadikan profil aktif. */
async function handleActivate(req: Request): Promise<Response> {
  const body = await readJson(req);
  if (!body) return json({ ok: false, error: "Body harus JSON." }, 400);

  const id = body.id === null ? null : String(body.id ?? "");
  const ok = setActive(id);
  if (!ok) return json({ ok: false, error: "Profil tidak ditemukan." }, 404);

  const cfg = resolveConfig();
  return json({
    ok: true,
    activeId: id,
    effective: { source: cfg.source, model: cfg.visionModel, profileName: cfg.profileName ?? null },
  });
}

/**
 * POST /api/profiles/test — uji koneksi ke gateway.
 *
 * Menerima `{id}` (profil tersimpan) ATAU `{baseUrl, apiKey, visionModel}`
 * (draft yang belum disimpan), supaya bisa dites sebelum disimpan.
 * Dengan `{withImage: true}` sekaligus memastikan model bisa membaca gambar.
 */
async function handleTestProfile(req: Request): Promise<Response> {
  const body = await readJson(req);
  if (!body) return json({ ok: false, error: "Body harus JSON." }, 400);

  let baseUrl = "";
  let apiKey = "";
  let visionModel = "";
  let timeoutMs = 30000;
  let profileId = "";

  if (body.id) {
    const p = getProfile(String(body.id));
    if (!p) return json({ ok: false, error: "Profil tidak ditemukan." }, 404);
    baseUrl = p.baseUrl;
    apiKey = p.apiKey;
    visionModel = p.visionModel;
    timeoutMs = p.timeoutMs;
    profileId = p.id;
  } else {
    baseUrl = normalizeBaseUrl(body.baseUrl ?? "");
    apiKey = String(body.apiKey ?? "").trim();
    visionModel = String(body.visionModel ?? "").trim() || "glm-5.3-flash";
  }

  if (!baseUrl || !apiKey) {
    return json({ ok: false, error: "Base URL dan API key wajib diisi." }, 400);
  }

  const withImage = body.withImage === true;
  const cfg = { baseUrl, apiKey, timeoutMs: Math.min(timeoutMs, 30000) };

  const messages: ChatMessage[] = withImage
    ? [
        {
          role: "user",
          content: [
            { type: "text", text: "Balas dengan satu kata: OK" },
            { type: "image_url", image_url: { url: TINY_PNG } },
          ],
        },
      ]
    : [{ role: "user", content: "Balas dengan satu kata: OK" }];

  try {
    const started = Date.now();
    const { text } = await callGateway(cfg, visionModel, messages, false);
    const ms = Date.now() - started;

    const msg = withImage
      ? `Terhubung dan gambar terbaca (${ms} ms). Jawaban: ${text.slice(0, 40)}`
      : `Terhubung (${ms} ms). Jawaban: ${text.slice(0, 40)}`;

    if (profileId) recordTest(profileId, true, msg);
    return json({ ok: true, ms, withImage, model: visionModel, reply: text.slice(0, 120), message: msg });
  } catch (err: any) {
    const m = String(err?.message ?? err);
    const msg = /abort/i.test(m)
      ? "Gateway tidak merespons sebelum batas waktu."
      : m;
    if (profileId) recordTest(profileId, false, msg);
    return json({ ok: false, error: msg, withImage, model: visionModel }, 200);
  }
}

/** POST /api/vision — analisis gambar produk. */
async function handleVision(req: Request): Promise<Response> {
  const body = await readJson(req);
  if (!body) return json({ error: "Body harus JSON." }, 400);

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

  if (isMock()) return json({ analysis: MOCK_ANALYSIS, usage: null, model: "mock" });

  const cfg = resolveConfig();
  if (cfg.source === "none") {
    return json(
      {
        error:
          "Belum ada profil API yang aktif. Buka halaman Pengaturan untuk " +
          "menambahkan Base URL dan API key.",
      },
      503,
    );
  }

  // Model dipilih browser, tapi divalidasi terhadap allowlist profil.
  const want = typeof body?.model === "string" ? body.model.trim() : "";
  const model = want && cfg.visionModels.includes(want) ? want : cfg.visionModel;

  const userContent: unknown[] = [
    {
      type: "text",
      text:
        `Analisis ${images.length} foto produk berikut. ` +
        (body?.hint ? `Petunjuk tambahan dari pengguna: ${String(body.hint).slice(0, 300)}` : ""),
    },
    ...images.map((url) => ({ type: "image_url", image_url: { url } })),
  ];

  try {
    const { text, usage } = await callGateway(
      cfg,
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
            ? `Gateway tidak merespons dalam ${Math.round(cfg.timeoutMs / 1000)} detik.`
            : `Gagal menganalisis gambar: ${msg}`,
      },
      status,
    );
  }
}

/** POST /api/enrich — tulis ulang narasi memakai model teks. */
async function handleEnrich(req: Request): Promise<Response> {
  const body = await readJson(req);
  if (!body) return json({ error: "Body harus JSON." }, 400);

  const scenes = Array.isArray(body?.scenes) ? body.scenes : [];
  if (!scenes.length) return json({ error: "Tidak ada scene yang dikirim." }, 400);

  if (isMock()) {
    return json({
      scenes: scenes.map((s: any) => ({ index: s.index, dialogue: s.current, onscreen: "" })),
      model: "mock",
    });
  }

  const cfg = resolveConfig();
  if (cfg.source === "none") return json({ error: "Belum ada profil API yang aktif." }, 503);

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
    const { text } = await callGateway(cfg, cfg.textModel, [{ role: "user", content: prompt }], true);
    return json({ ...extractJson(text), model: cfg.textModel });
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
const INTERNAL = /^_/;     // _ai-profiles.json, _srv-out.txt, _srv.pid
const LOGFILE = /\.log$/i; // *.log

/**
 * Tolak path yang menunjuk ke berkas internal.
 *
 * Ini yang melindungi `_ai-profiles.json` (berisi semua API key) dan `.env`.
 * `.gitignore` hanya melindungi GIT dan tidak berpengaruh pada layer HTTP.
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
      const m = req.method;

      if (pathname === "/api/status" && m === "GET") return handleStatus();
      if (pathname === "/api/profiles" && m === "GET") return handleListProfiles();
      if (pathname === "/api/profiles" && m === "POST") return handleSaveProfile(req);
      if (pathname === "/api/profiles" && m === "DELETE") return handleDeleteProfile(url);
      if (pathname === "/api/profiles/activate" && m === "POST") return handleActivate(req);
      if (pathname === "/api/profiles/test" && m === "POST") return handleTestProfile(req);
      if (pathname === "/api/vision" && m === "POST") return handleVision(req);
      if (pathname === "/api/enrich" && m === "POST") return handleEnrich(req);

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

function bannerAiLine(): string {
  if (isMock()) return "AKTIF (mode uji, tanpa jaringan)";
  const cfg = resolveConfig();
  if (cfg.source === "none") return "belum ada profil aktif (atur di halaman Pengaturan)";
  const who = cfg.source === "profile" ? `profil "${cfg.profileName}"` : "dari .env";
  return `siap — ${who}, vision: ${cfg.visionModel} @ ${hostOf(cfg.baseUrl)}`;
}

console.log("");
console.log("  FlowAffiliate — server lokal berjalan");
console.log("  ────────────────────────────────────────");
console.log(`  Aplikasi   :  http://${HOST}:${PORT}/`);
console.log(`  Demo       :  http://${HOST}:${PORT}/demo`);
console.log(`  Test suite :  http://${HOST}:${PORT}/test`);
console.log(`  Pengaturan :  http://${HOST}:${PORT}/#settings`);
console.log(`  Analisis AI:  ${bannerAiLine()}`);
console.log("");
console.log("  Tekan Ctrl+C untuk berhenti.");
console.log("");
