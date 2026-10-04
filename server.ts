/**
 * FlowAffiliate — server statis untuk localhost.
 *
 * Aplikasi ini murni statis (tanpa build step, tanpa dependensi), jadi server
 * ini hanya perlu menyajikan berkas dari folder yang sama dengan MIME type
 * yang benar.
 *
 * Jalankan:  bun run server.ts
 * Lalu buka: http://localhost:3000
 */

import { join, normalize, extname } from "node:path";

const ROOT = import.meta.dir;
const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "localhost";

/** Halaman 404 yang aman — tidak membocorkan isi path aslinya. */
function notFoundHtml(requested: string): string {
  // Escape minimal agar path yang diminta user tidak tertanam mentah di HTML.
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
 * sekali. Tanpa pemeriksaan ini, `/_srv-err.txt` atau `/.env` akan ikut
 * terservis ke siapa pun yang membuka localhost. `.env` adalah yang paling
 * berbahaya: berisi API key, dan file mode=hosting tidak mem-filternya.
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
  // Buang query/hash yang mungkin lolos, lalu normalisasi.
  const clean = decoded.split("?")[0].split("#")[0];

  // Blokir berkas internal SEBELUM resolve, supaya tidak ada jalan memutar.
  if (isBlockedPath(clean)) return null;

  const target = normalize(join(ROOT, clean));
  if (target !== ROOT && !target.startsWith(ROOT + "\\") && !target.startsWith(ROOT + "/")) {
    return null;
  }
  return target;
}

const server = Bun.serve({
  port: PORT,
  hostname: HOST,

  async fetch(req) {
    const url = new URL(req.url);
    let pathname = url.pathname;

    // Rute nyaman untuk demo.
    if (pathname === "/demo" || pathname === "/demo/") {
      return Response.redirect(new URL("/index.html?demo=1", url).toString(), 302);
    }
    if (pathname === "/test" || pathname === "/test/") {
      return Response.redirect(new URL("/test-suite.html", url).toString(), 302);
    }
    if (pathname === "/") pathname = "/index.html";

    const filePath = resolveSafe(pathname);
    if (!filePath) {
      // 404, bukan 400/403: jangan sampai terungkap bahwa berkas internal
      // tersebut memang ada tapi memang sengaja disembunyikan.
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
      // Selalu ambil versi terbaru saat pengembangan.
      "Cache-Control": "no-cache",
    };

    // Jangan cache halaman HTML agar perubahan langsung terlihat.
    if (ext === ".html") headers["Cache-Control"] = "no-store";

    return new Response(file, { headers });
  },

  error(err) {
    console.error("[FlowAffiliate] server error:", err);
    return new Response("500 Internal Server Error", { status: 500 });
  },
});

console.log("");
console.log("  FlowAffiliate — server lokal berjalan");
console.log("  ────────────────────────────────────────");
console.log(`  Aplikasi  :  http://${HOST}:${PORT}/`);
console.log(`  Demo      :  http://${HOST}:${PORT}/demo`);
console.log(`  Test suite:  http://${HOST}:${PORT}/test`);
console.log("");
console.log("  Tekan Ctrl+C untuk berhenti.");
console.log("");
