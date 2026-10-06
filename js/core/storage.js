/* =========================================================================
 * FlowAffiliate — Storage (Library)
 * Menyimpan project di localStorage. Gambar TIDAK disimpan (privasi +
 * keterbatasan kuota). PRD §8.6.
 * ========================================================================= */

window.FA = window.FA || {};

FA.Store = {
  KEY: "fa_projects_v1",
  MAX: 30,

  available: function () {
    try {
      localStorage.setItem("__fa_t", "1");
      localStorage.removeItem("__fa_t");
      return true;
    } catch (e) { return false; }
  },

  all: function () {
    try {
      var raw = localStorage.getItem(FA.Store.KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  },

  save: function (project) {
    if (!FA.Store.available()) return false;
    try {
      var list = FA.Store.all();
      // Simpan hanya data teks (tanpa objek File/gambar).
      var slim = {
        id: project.id,
        seed: project.seed,
        createdAt: project.createdAt,
        productName: project.brief.productName,
        platformLabel: (FA.PLATFORMS[project.brief.platform] || {}).label || "-",
        playbookLabel: project.playbookLabel,
        totalDuration: project.totalDuration,
        sceneCount: project.scenes.length,
        enrichmentSource: project.enrichmentSource,
        payload: JSON.parse(FA.buildProjectJSON(project)),
      };
      list = list.filter(function (p) { return p.id !== slim.id; });
      list.unshift(slim);
      if (list.length > FA.Store.MAX) list = list.slice(0, FA.Store.MAX);
      localStorage.setItem(FA.Store.KEY, JSON.stringify(list));
      return true;
    } catch (e) {
      console.warn("[FlowAffiliate] Gagal menyimpan:", e.message);
      return false;
    }
  },

  remove: function (id) {
    try {
      var list = FA.Store.all().filter(function (p) { return p.id !== id; });
      localStorage.setItem(FA.Store.KEY, JSON.stringify(list));
      return true;
    } catch (e) { return false; }
  },

  clear: function () {
    try { localStorage.removeItem(FA.Store.KEY); return true; }
    catch (e) { return false; }
  },

  /* Bangun ulang project agar bisa dirender dari library.
   * Prompt sudah tersimpan jadi tidak perlu generate ulang. */
  revive: function (slim) {
    var p = slim.payload;
    return {
      id: p.id,
      seed: p.seed,
      createdAt: p.createdAt,
      brief: {
        productName: p.brief.productName,
        productDescription: p.brief.productDescription || "",
        category: p.brief.category,
        platform: p.brief.platform,
        aspect: p.brief.aspect,
        price: p.brief.price,
        promo: p.brief.promo,
        pain: p.brief.pain,
        audience: p.brief.audience,
        audienceId: p.brief.audienceId || "",
        style: p.brief.style,
        voice: FA.VOICES[p.brief.voice] || FA.VOICES.sahabat,
        pacing: p.brief.pacing,
        hasCharacterRef: false,
        photoCount: p.brief.photoCount || 0,
        photoAnchor: !!p.brief.photoAnchor,
      },
      playbookId: p.brief.category,
      playbookLabel: slim.playbookLabel,
      styleId: p.brief.style,
      voiceId: p.brief.voice,
      pacingId: p.brief.pacing,
      continuity: p.continuity,
      vars: {},
      enrichmentSource: p.enrichmentSource,
      totalDuration: p.totalDuration,
      scenes: p.scenes.map(function (s) {
        return {
          index: s.index,
          archetype: { id: s.archetype, label: s.label, purpose: "" },
          commands: s.commands,
          duration: s.duration,
          prompt: s.prompt,
          dialogue: s.narration,
          onscreen: s.onscreenText,
          valid: s.valid,
          validation: s.checks || [],
          _productName: p.brief.productName,
        };
      }),
      caption: p.caption,
      projectChecks: [],
      valid: true,
      fromLibrary: true,
    };
  },
};
