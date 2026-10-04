/* =========================================================================
 * FlowAffiliate — Narration Enrichment (OPSIONAL, mati secara default)
 *
 * Menyempurnakan dialog & teks layar memakai model teks lewat proxy server
 * (/api/enrich). Berbeda dari analisis gambar yang otomatis, fitur ini
 * opsional dan default MATI karena memanggil AI sekali lagi (menambah biaya
 * dan waktu).
 *
 * PRD §8.3: LLM hanya mengisi slot kreatif. Struktur prompt, blok continuity,
 * dan aturan teknis tetap dari Conductor Engine — bukan dari model.
 * ========================================================================= */

window.FA = window.FA || {};

FA.AI = {
  /** Preferensi disimpan di browser; ini bukan rahasia, hanya pilihan. */
  isEnabled: function () {
    try { return localStorage.getItem("fa_enrich") === "1"; }
    catch (e) { return false; }
  },

  setEnabled: function (on) {
    try {
      if (on) localStorage.setItem("fa_enrich", "1");
      else localStorage.removeItem("fa_enrich");
    } catch (e) { /* localStorage bisa diblokir di file:// */ }
  },

  /** Kirim scene ke proxy. Selalu resolve null bila gagal — pemanggil akan
   *  memakai versi offline. Aplikasi tidak pernah gagal karena AI. */
  enrich: function (project) {
    if (!FA.AI.isEnabled()) return Promise.resolve(null);
    if (!FA.Vision.available()) return Promise.resolve(null);

    var payload = {
      productName: project.brief.productName,
      category: project.playbookId,
      pains: project.vars && project.vars.pain ? [project.vars.pain] : [],
      benefits: project.vars && project.vars.benefit ? [project.vars.benefit] : [],
      scenes: project.scenes.map(function (s) {
        return { index: s.index, duration: s.duration, current: s.dialogue };
      }),
    };

    return fetch("/api/enrich", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        return res.json().then(function (d) {
          if (!res.ok) throw new Error(d && d.error ? d.error : "HTTP " + res.status);
          return d;
        });
      })
      .then(function (parsed) { return FA.AI.applyEnrichment(project, parsed); })
      .catch(function (err) {
        console.warn("[FlowAffiliate] penyempurnaan narasi dilewati:", err.message);
        return null;
      });
  },

  /** Terapkan hasil model, lalu VALIDASI ulang. Scene yang melanggar batas
   *  kata dikembalikan ke versi offline — model tidak boleh merusak output. */
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

      // Rakit ulang prompt dengan konten yang sudah disempurnakan.
      scene.prompt = FA.assemblePrompt(scene, scene.enriched, project.continuity, project.brief);
    });

    if (applied === 0) return null;

    project.enrichmentSource = "ai";
    project.caption = FA.buildCaption(project);
    return FA.validateProject(project);
  },
};
