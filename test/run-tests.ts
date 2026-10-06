/* =========================================================================
 * FlowAffiliate — Headless test runner
 *
 * Jalankan:  bun run test/run-tests.ts
 *
 * Menjalankan test-suite.html di luar browser: skrip tes diekstrak langsung
 * dari test-suite.html (satu sumber kebenaran), modul aplikasi dimuat dalam
 * urutan yang sama seperti index.html, lalu ringkasan dicetak ke terminal.
 * Exit code 1 bila ada tes yang gagal.
 * ========================================================================= */

import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");

/* ---- Stub lingkungan browser minimum yang disentuh modul inti ---- */
const backing = new Map<string, string>();

(globalThis as any).window = globalThis;
(globalThis as any).location = { protocol: "http:" };
(globalThis as any).navigator = {};
(globalThis as any).localStorage = {
  getItem: (k: string) => (backing.has(k) ? (backing.get(k) as string) : null),
  setItem: (k: string, v: string) => { backing.set(k, String(v)); },
  removeItem: (k: string) => { backing.delete(k); },
  clear: () => { backing.clear(); },
};
(globalThis as any).document = {
  getElementById: () => ({ innerHTML: "", textContent: "", className: "" }),
  createElement: () => ({}),
  querySelectorAll: () => [],
};

/* ---- Muat modul aplikasi, urutan sama seperti index.html ---- */
const MODULES = [
  "js/core/utils.js",
  "js/data/commands.js",
  "js/data/platforms.js",
  "js/data/archetypes.js",
  "js/data/playbooks.js",
  "js/data/audiences.js",
  "js/core/conductor.js",
  "js/core/vision.js",
  "js/core/ai.js",
  "js/core/export.js",
  "js/core/storage.js",
  "js/ui/render.js",
];

const bundle = MODULES.map((f) => readFileSync(join(ROOT, f), "utf8")).join("\n");
(0, eval)(bundle + "\n//# sourceURL=flowaffiliate-bundle.js");

/* ---- Eksekusi skrip tes dari test-suite.html ---- */
const html = readFileSync(join(ROOT, "test-suite.html"), "utf8");
const inline = html.match(/<script>\r?\n([\s\S]*?)<\/script>/);
if (!inline) {
  console.error("Skrip tes tidak ditemukan di test-suite.html");
  process.exit(1);
}
(0, eval)(inline[1] + "\n//# sourceURL=test-suite-inline.js");

const r = (globalThis as any).__TEST_RESULT;
if (!r) {
  console.error("Tes tidak menghasilkan window.__TEST_RESULT");
  process.exit(1);
}

if (r.failures.length) {
  console.log("Gagal:");
  for (const f of r.failures) console.log("  ✗ " + f);
}
console.log(
  `\n${r.failed === 0 ? "✓ SEMUA TES LOLOS" : "✗ ADA TES GAGAL"} — ` +
  `${r.passed} lolos, ${r.failed} gagal ` +
  `(dari ${r.total} pemeriksaan, ${r.comboOk}/${r.combos} kombinasi)`,
);
process.exit(r.failed === 0 ? 0 : 1);
