/* =========================================================================
 * FlowAffiliate — AI Enrichment Layer (OPSIONAL)
 *
 * PRD §8.3: LLM HANYA mengisi slot kreatif (dialog, teks layar). Struktur
 * prompt, blok continuity, dan aturan teknis tetap dari Conductor Engine.
 *
 * Bila tidak ada API key atau request gagal -> otomatis fallback ke mode
 * offline deterministik. Aplikasi TIDAK PERNAH gagal karena AI.
 * ========================================================================= */

window.FA = window.FA || {};

FA.AI = {
  MODEL: "gemini-2.0-flash",
  ENDPOINT: "https://generativelanguage.googleapis.com/v1beta/models/",
  TIMEOUT_MS: 25000,

  getKey: function () {
    try { return localStorage.getItem("fa_api_key") || ""; } catch (e) { return ""; }
  },

  setKey: function (key) {
    try {
      if (key) localStorage.setItem("fa_api_key", key);
      else localStorage.removeItem("fa_api_key");
    } catch (e) { /* localStorage bisa diblokir di file:// */ }
  },

  isEnabled: function () {
    return !!FA.AI.getKey();
  },

  /* Bangun prompt untuk LLM: minta JSON ketat, hanya slot kreatif. */
  buildMetaPrompt: function (project) {
    var lines = [];
    project.scenes.forEach(function (s) {
      lines.push(
        "Scene " + s.index + " (" + s.archetype.label + ", " + s.duration + "s, " +
        "maks " + FA.wordBudget(s.duration) + " kata):"
      );
      lines.push("  saat ini: \"" + s.dialogue + "\"");
    });

    return [
      "Kamu copywriter iklan affiliate Indonesia yang spesialis hook viral TikTok/Shopee.",
      "",
      "PRODUK: " + (project.brief.productName || "-"),
      "KATEGORI: " + project.playbookLabel,
      "MASALAH TARGET: " + project.vars.pain,
      "MANFAAT UTAMA: " + project.vars.benefit,
      "CARA PAKAI: " + project.vars.usage,
      "AUDIENS: " + project.vars.audience,
      "PLATFORM: " + project.brief.platform,
      "GAYA SUARA: " + project.brief.voice.label + " (" + project.brief.voice.directive + ")",
      "",
      "TUGAS: Tulis ulang dialog untuk tiap scene agar lebih natural, spesifik, dan",
      "menggugah. Bahasa Indonesia gaul tapi sopan. JANGAN mengarang klaim kesehatan",
      "atau angka statistik. JANGAN menyebut harga.",
      "Teks layar maksimal " + FA.ONSCREEN_MAX_WORDS + " kata, huruf kapital di awal kata.",
      "",
      "BATAS KATA PER SCENE (WAJIB DIPATUHI):",
      lines.join("\n"),
      "",
      "Balas HANYA dengan JSON valid, tanpa markdown, format:",
      '{"scenes":[{"index":1,"dialogue":"...","onscreen":"..."}]}',
    ].join("\n");
  },

  /* Panggil Gemini. Return null bila gagal (pemanggil akan fallback). */
  enrich: function (project) {
    if (!FA.AI.isEnabled()) return Promise.resolve(null);

    var key = FA.AI.getKey();
    var url = FA.AI.ENDPOINT + FA.AI.MODEL + ":generateContent?key=" + encodeURIComponent(key);

    var body = {
      contents: [{ parts: [{ text: FA.AI.buildMetaPrompt(project) }] }],
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      },
    };

    var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = setTimeout(function () {
      if (controller) controller.abort();
    }, FA.AI.TIMEOUT_MS);

    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller ? controller.signal : undefined,
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        var text =
          data &&
          data.candidates &&
          data.candidates[0] &&
          data.candidates[0].content &&
          data.candidates[0].content.parts &&
          data.candidates[0].content.parts[0] &&
          data.candidates[0].content.parts[0].text;
        if (!text) throw new Error("respons kosong");

        var parsed;
        try {
          parsed = JSON.parse(text);
        } catch (e) {
          // Kadang model membungkus JSON dengan ```json ... ```
          var m = text.match(/\{[\s\S]*\}/);
          if (!m) throw new Error("JSON tidak valid");
          parsed = JSON.parse(m[0]);
        }
        return parsed;
      })
      .then(function (parsed) {
        clearTimeout(timer);
        return FA.AI.applyEnrichment(project, parsed);
      })
      .catch(function (err) {
        clearTimeout(timer);
        console.warn("[FlowAffiliate] AI enrichment gagal, pakai mode offline:", err.message);
        return null;
      });
  },

  /* Terapkan hasil LLM ke project, VALIDASI ulang tiap scene.
   * Scene yang melanggar batas kata akan dikembalikan ke versi offline. */
  applyEnrichment: function (project, parsed) {
    if (!parsed || !Array.isArray(parsed.scenes)) return null;
    var applied = 0;

    parsed.scenes.forEach(function (item) {
      var scene = project.scenes.filter(function (s) { return s.index === item.index; })[0];
      if (!scene) return;

      var budget = FA.wordBudget(scene.duration);
      var dialogue = String(item.dialogue || "").trim();
      var onscreen = String(item.onscreen || "").trim();

      // Tolak dialog yang melampaui budget — pertahankan versi offline.
      if (dialogue && FA.countWords(dialogue) <= budget) {
        scene.dialogue = dialogue;
        scene.enriched.dialogue = dialogue;
        applied++;
      }
      if (onscreen && FA.countWords(onscreen) <= FA.ONSCREEN_MAX_WORDS) {
        scene.onscreen = onscreen;
        scene.enriched.onscreen = onscreen;
      }

      // Rakit ulang prompt dengan konten yang sudah diperkaya.
      scene.prompt = FA.assemblePrompt(scene, scene.enriched, project.continuity, project.brief);
    });

    if (applied === 0) return null;

    project.enrichmentSource = "ai";
    project.caption = FA.buildCaption(project);
    return FA.validateProject(project);
  },
};
