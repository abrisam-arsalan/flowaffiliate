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
      return new Response("400 Bad Request — path tidak valid", { status: 400 });
    }

    const file = Bun.file(filePath);

    if (!(await file.exists())) {
      // Fallback 404 yang informatif.
      const notFound = `<!doctype html><meta charset="utf-8">
<title>404 — FlowAffiliate</title>
<body style="font-family:system-ui;background:#0e1013;color:#eef2f6;padding:40px">
<h1 style="color:#4ade80">404</h1>
<p>Berkas <code>${pathname.replace(/[<>&]/g, "")}</code> tidak ditemukan.</p>
<p><a href="/" style="color:#60a5fa">← Kembali ke aplikasi</a></p>`;
      return new Response(notFound, {
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
