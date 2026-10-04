/* =========================================================================
 * FlowAffiliate — Utilities
 * Randomisasi deterministik (seeded), template filling, dan text helpers.
 * Seed penting agar hasil generate bisa direproduksi & di-debug. PRD §8.3.
 * ========================================================================= */

window.FA = window.FA || {};

/* ------------------------------------------------- Seeded PRNG (mulberry32) */
FA.makeRng = function (seed) {
  var a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

FA.hashString = function (str) {
  var h = 2166136261 >>> 0;
  for (var i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

FA.pick = function (arr, rng) {
  if (!arr || !arr.length) return "";
  return arr[Math.floor(rng() * arr.length) % arr.length];
};

/* Pilih n item unik dari array */
FA.pickMany = function (arr, n, rng) {
  var pool = arr.slice();
  var out = [];
  n = Math.min(n, pool.length);
  for (var i = 0; i < n; i++) {
    var idx = Math.floor(rng() * pool.length) % pool.length;
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
};

/* ------------------------------------------------------- Template filling */
FA.fill = function (template, vars) {
  return String(template).replace(/\{\{(\w+)\}\}/g, function (m, key) {
    return vars[key] !== undefined && vars[key] !== "" ? vars[key] : m;
  });
};

FA.countWords = function (text) {
  var t = String(text || "").trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
};

/* Buang placeholder yang tidak terisi agar prompt tidak bocor "{{...}}" */
FA.stripUnfilled = function (text) {
  return String(text).replace(/\{\{\w+\}\}/g, "").replace(/[ \t]{2,}/g, " ").replace(/ ,/g, ",");
};

/* ------------------------------------------------------------- Slug & ID */
FA.slugify = function (text) {
  return String(text || "project")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "project";
};

FA.newId = function (prefix) {
  var rnd = Math.random().toString(36).slice(2, 8);
  return (prefix || "id") + "_" + Date.now().toString(36) + "_" + rnd;
};

/* ------------------------------------------------------------- Date/Time */
FA.formatDuration = function (totalSeconds) {
  var m = Math.floor(totalSeconds / 60);
  var s = totalSeconds % 60;
  if (m === 0) return s + " detik";
  if (s === 0) return m + " menit";
  return m + " menit " + s + " detik";
};

/* ---------------------------------------------------------- Escape untuk HTML */
FA.esc = function (text) {
  return String(text === undefined || text === null ? "" : text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

/* ------------------------------------------------------------- Download */
FA.downloadText = function (filename, content) {
  var blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
};

/* ---------------------------------------------------------- Clipboard */
FA.copyText = function (text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise(function (resolve, reject) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      resolve();
    } catch (e) { reject(e); }
  });
};
