/* =========================================================================
 * FlowAffiliate — Export Builder
 * Menyusun paket teks siap copy ke Google Flow. PRD §9.4.
 * ========================================================================= */

window.FA = window.FA || {};

FA.buildExportPackage = function (project) {
  var b = project.brief;
  var pb = FA.PLAYBOOKS[project.playbookId];
  var platform = FA.PLATFORMS[b.platform] || FA.PLATFORMS.tiktok;

  /* Mode anchor foto mengubah urutan kerja di Flow: scene produk-hero dibuat
   * dulu dari foto (Frames to Video), baru scene bertalent. */
  var anchorOn = FA.usesPhotoAnchor(b);
  var heroIdx = [];
  var talentIdx = [];
  project.scenes.forEach(function (s) {
    (s.archetype.anchorMode === "frame" ? heroIdx : talentIdx).push(s.index);
  });

  var L = [];

  L.push("=== FLOWAFFILIATE — PAKET PROMPT ===");
  L.push("Produk   : " + (b.productName || "-"));
  L.push("Kategori : " + project.playbookLabel);
  L.push("Platform : " + platform.label);
  L.push("Total    : 6 scene · " + project.totalDuration + " detik");
  L.push("Dibuat   : " + new Date(project.createdAt).toLocaleString("id-ID"));
  L.push("");

  L.push("--- CARA PAKAI DI GOOGLE FLOW ---");
  L.push("1. Buka labs.google/fx/tools/flow lalu buat project baru.");
  L.push("2. Set model ke Gemini Omni Flash, aspect ratio " + project.brief.aspect + ".");
  if (anchorOn) {
    L.push("3. DUA LANGKAH supaya produk tidak meleset:");
    L.push("   a. Scene produk-hero (Scene " + heroIdx.join(", ") + "): pilih mode Frames to Video,");
    L.push("      jadikan foto produk sebagai frame awal, set durasi, generate lebih dulu.");
    L.push("   b. Scene bertalent (Scene " + talentIdx.join(", ") + "): pilih mode Ingredients to Video,");
    L.push("      upload semua foto produk" + (b.hasCharacterRef ? " + foto karakter" : "") +
           " sebagai prop terkunci.");
    L.push("4. Copy prompt tiap scene, paste sesuai modenya, set durasi, generate.");
    L.push("5. Ulangi untuk scene sisanya. Blok continuity sudah sama, jadi karakter");
    L.push("   dan lokasi akan konsisten.");
    L.push("6. Gabungkan 6 klip (urut), tambahkan musik, lalu upload ke " + platform.label + ".");
  } else {
    L.push("3. Pilih mode Ingredients to Video.");
    L.push("4. Upload semua foto produk" + (b.hasCharacterRef ? " + foto karakter" : "") + " sebagai ingredient.");
    L.push("5. Copy prompt Scene 1, paste, set durasi " + project.scenes[0].duration + " detik, generate.");
    L.push("6. Ulangi untuk Scene 2 sampai 6. Blok continuity sudah sama, jadi karakter");
    L.push("   dan lokasi akan konsisten.");
    L.push("7. Gabungkan 6 klip (urut), tambahkan musik, lalu upload ke " + platform.label + ".");
  }
  L.push("");

  L.push("=== SETELAN GOOGLE FLOW ===");
  L.push("Model      : Gemini Omni Flash");
  L.push("Aspect     : " + b.aspect);
  L.push("Gaya visual: " + FA.STYLES[project.styleId].label);
  L.push("Suara      : " + b.voice.label + " (" + b.voice.descriptor + ")");
  L.push("Pacing     : " + FA.PACING[project.pacingId].label);
  L.push("Angle      : " + (project.hookAngle
    ? project.hookAngle.label + " (" + project.hookAngle.title + ")"
    : "-"));
  L.push("Anchor     : " + (anchorOn
    ? "foto produk = frame awal scene hero (Scene " + heroIdx.join(", ") +
      ") + prop terkunci scene talent (Scene " + talentIdx.join(", ") + ")"
    : "mati — produk dikunci lewat teks (blok PRODUCT FIDELITY)"));
  L.push("Analisis   : " + (
    project.analysisSource === "ai"
      ? "AI vision" + (project.analysis && project.analysis.model
          ? " (" + project.analysis.model + ")" : "")
      : project.analysisSource === "mock"
        ? "mode uji AI_MOCK (tanpa jaringan)"
        : "heuristik keyword (tanpa AI)"
  ));
  if (project.analysis && project.analysis.productDescription) {
    L.push("Deskripsi  : " + project.analysis.productDescription);
  }
  L.push("");

  project.scenes.forEach(function (s) {
    L.push("================================================================");
    L.push("SCENE " + s.index + "/6 — " + s.archetype.label.toUpperCase() +
           " (" + s.duration + "s)");
    L.push("Command: " + s.commands.join(" "));
    L.push("Tujuan : " + s.archetype.purpose);
    L.push("================================================================");
    L.push("");
    L.push(s.prompt);
    L.push("");
    L.push("--- NARASI (Voice-Over Indonesia) ---");
    L.push('"' + s.dialogue + '"');
    L.push("");
    L.push("--- TEKS DI LAYAR ---");
    L.push('"' + s.onscreen + '"');
    L.push("");
    L.push("--- STATUS VALIDASI ---");
    var failed = s.validation.filter(function (c) { return !c.pass; });
    L.push(failed.length === 0
      ? "✓ Semua pemeriksaan lolos (" + s.validation.length + "/" + s.validation.length + ")"
      : "✗ Gagal: " + failed.map(function (c) { return c.id; }).join(", "));
    L.push("");
  });

  L.push("================================================================");
  L.push("CAPTION & HASHTAG — " + platform.label.toUpperCase());
  L.push("================================================================");
  L.push("");
  L.push("-- 3 VARIAN HOOK (pilih satu) --");
  project.caption.hooks.forEach(function (h, i) {
    var mark = i === (project.caption.selectedHook || 0) ? " ← DIPAKAI" : "";
    L.push((i + 1) + ". [" + h.type + "] " + h.text + mark);
  });
  L.push("");
  L.push("-- CAPTION LENGKAP --");
  L.push(project.caption.caption);
  L.push("");
  L.push("-- HASHTAG (" + project.caption.hashtags.length + ") --");
  L.push(project.caption.hashtags.join(" "));
  L.push("");
  L.push("Catatan: " + project.caption.hashtagNote);
  L.push("Estimasi jam posting terbaik: " + project.caption.bestTime);
  L.push("");
  L.push("=== SELESAI ===");

  return L.join("\n");
};

/* Ringkasan JSON untuk backup / integrasi lanjutan. */
FA.buildProjectJSON = function (project) {
  return JSON.stringify({
    id: project.id,
    seed: project.seed,
    createdAt: project.createdAt,
    brief: {
      productName: project.brief.productName,
      productDescription: project.brief.productDescription || "",
      category: project.brief.category,
      platform: project.brief.platform,
      aspect: project.brief.aspect,
      price: project.brief.price,
      promo: project.brief.promo,
      pain: project.brief.pain,
      audience: project.brief.audience,
      audienceId: project.brief.audienceId || "",
      photoCount: project.brief.photoCount || 0,
      photoAnchor: FA.usesPhotoAnchor(project.brief),
      style: project.styleId,
      voice: project.voiceId,
      pacing: project.pacingId,
    },
    continuity: project.continuity,
    enrichmentSource: project.enrichmentSource,
    hookAngle: project.hookAngle ? project.hookAngle.id : null,
    totalDuration: project.totalDuration,
    scenes: project.scenes.map(function (s) {
      return {
        index: s.index,
        archetype: s.archetype.id,
        label: s.archetype.label,
        commands: s.commands,
        duration: s.duration,
        prompt: s.prompt,
        narration: s.dialogue,
        onscreenText: s.onscreen,
        valid: s.valid,
        checks: s.validation.map(function (c) {
          return { id: c.id, label: c.label, pass: c.pass, detail: c.detail };
        }),
      };
    }),
    caption: project.caption,
  }, null, 2);
};
