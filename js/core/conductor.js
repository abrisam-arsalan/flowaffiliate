/* =========================================================================
 * FlowAffiliate — Conductor Engine
 *
 * Mesin prompt DETERMINISTIK. LLM (bila tersedia) hanya mengisi slot kreatif;
 * struktur prompt, blok continuity, dan aturan teknis selalu berasal dari
 * kode ini. Lihat PRD §8.3.
 *
 * Pipeline:
 *   1. Continuity Resolver  -> satu objek continuity untuk 6 scene
 *   2. Scene Router         -> arketipe + command + durasi
 *   3. Enrichment           -> isi slot (dialog, teks layar, sfx)
 *   4. Prompt Assembler     -> rakit 7 blok
 *   5. Validator            -> 11 checklist PRD §14.B
 * ========================================================================= */

window.FA = window.FA || {};

/* Kapitalkan huruf pertama tanpa mengubah sisa string. */
FA.capitalize = function (s) {
  s = String(s || "");
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/* ======================================================================
 * 1. CONTINUITY RESOLVER
 * Membuat SATU objek continuity yang disuntikkan identik ke 6 prompt.
 * ==================================================================== */
FA.resolveContinuity = function (brief, playbook, style, voice) {
  var c = playbook.continuity;
  var keep = brief.keepCharacter && brief.talentOverride
    ? brief.talentOverride
    : c.talent;

  var gradeText = FA.capitalize(c.grade);
  if (style && style.grade) {
    gradeText += ". " + FA.capitalize(style.grade);
  }

  return {
    talent: keep,
    wardrobe: c.wardrobe,
    location: c.location,
    lighting: c.lighting,
    grade: gradeText,
    cameraStyle: style && style.camera ? style.camera : "",
    voiceDescriptor: voice.descriptor,
    voiceDirective: voice.directive,
    productName: brief.productName || "the product",
  };
};

/* Blok continuity yang ditulis kata-per-kata sama di setiap prompt. */
FA.buildContinuityBlock = function (ct, brief) {
  return [
    "[CONTINUITY LOCK — identical in all 6 scenes, do not alter]",
    "Character: " + ct.talent + ".",
    "Wardrobe: " + ct.wardrobe + ".",
    "Location: " + ct.location + ".",
    "Lighting: " + ct.lighting + ".",
    "Colour grade: " + ct.grade + ".",
    "Keep face, wardrobe, location, lighting and grade IDENTICAL across all scenes.",
    "Product: " + ct.productName + " — keep the same shape, label and cap in every shot.",
  ].join("\n");
};

/* ======================================================================
 * 2. SCENE ROUTER
 * ==================================================================== */
FA.routeScenes = function (brief, pacing) {
  return FA.ARCHETYPE_ORDER.map(function (archId, i) {
    var arch = FA.ARCHETYPES[archId];
    return {
      index: i + 1,
      archetype: arch,
      commands: arch.commands.slice(),
      duration: pacing.durations[i],
    };
  });
};

/* Pengganti frasa masalah pada kemunculan kedua dan seterusnya, supaya
 * narasi tidak mengulang frasa panjang yang sama persis di banyak scene. */
FA.PAIN_REFERENCE = "masalah itu";

/* ======================================================================
 * 3. ENRICHMENT — mode offline (deterministik, tanpa API)
 * Memilih dialog & teks layar yang MUAT dalam word budget durasi scene.
 * ==================================================================== */
FA.enrichOffline = function (scene, ctx) {
  var rng = ctx.rng;
  var arch = scene.archetype;
  var budget = FA.wordBudget(scene.duration);

  // Saring kandidat dialog yang muat dalam budget, lalu pilih acak.
  var fits = arch.dialogueCandidates.filter(function (d) {
    var filled = FA.fill(d, ctx.vars);
    return FA.countWords(filled) <= budget;
  });
  var picked = fits.length ? FA.pick(fits, rng) : arch.dialogueCandidates[0];

  // Hitung pemakaian frasa masalah. Kemunculan kedua+ memakai rujukan pendek
  // agar narasi terdengar seperti orang berbicara, bukan mengulang brief.
  var usesPain = picked.indexOf("{{pain}}") !== -1;
  if (usesPain) ctx.painUses = (ctx.painUses || 0) + 1;

  var fillVars = ctx.vars;
  if (usesPain && ctx.painUses > 1) {
    fillVars = Object.assign({}, ctx.vars, { pain: FA.PAIN_REFERENCE });
  }

  var dialogue = FA.stripUnfilled(FA.fill(picked, fillVars));

  // Teks layar: maksimal 5 kata (PRD §8.3).
  var onscreenFits = arch.onscreenCandidates.filter(function (t) {
    return FA.countWords(t) <= FA.ONSCREEN_MAX_WORDS;
  });
  var onscreen = FA.pick(onscreenFits.length ? onscreenFits : arch.onscreenCandidates, rng);

  return {
    dialogue: dialogue,
    onscreen: onscreen,
    shot: FA.stripUnfilled(FA.fill(arch.shot, ctx.vars)),
    // Setting dimulai sebagai awal kalimat -> huruf pertama dikapitalkan.
    setting: FA.capitalize(FA.stripUnfilled(FA.fill(arch.setting, ctx.vars))),
    camera: FA.stripUnfilled(FA.fill(arch.camera, ctx.vars)),
    sfx: arch.sfx,
    music: arch.music,
    source: "offline",
  };
};

/* ======================================================================
 * 4. PROMPT ASSEMBLER — 7 blok wajib (PRD §6.1)
 * ==================================================================== */
FA.assemblePrompt = function (scene, enriched, ct, brief) {
  var arch = scene.archetype;
  var aspect = brief.aspect || FA.DEFAULT_ASPECT;
  var voice = brief.voice;

  var blocks = [];

  /* --- Blok 1: REFERENCE DECLARATION --- */
  blocks.push(
    "[REFERENCE]\n" +
    "Use the uploaded product image as the primary product reference for " +
    ct.productName + ".\n" +
    (brief.hasCharacterRef
      ? "Use the uploaded character photo as the identity reference for the talent."
      : "Use the continuity description below to keep the talent consistent.")
  );

  /* --- Blok 2: CONTINUITY LOCK --- */
  blocks.push(FA.buildContinuityBlock(ct, brief));

  /* --- Blok 3: SHOT & SUBJECT --- */
  blocks.push("[SHOT]\n" + enriched.shot);

  /* --- Blok 4: SETTING & LIGHTING --- */
  blocks.push("[SETTING & LIGHTING]\n" + enriched.setting);

  /* --- Blok 5: CAMERA --- */
  blocks.push("[CAMERA]\n" + enriched.camera);

  /* --- Blok 6: AUDIO & DIALOGUE --- */
  var audio =
    "[AUDIO]\n" +
    "Ambience: quiet natural room tone.\n" +
    "Music: " + enriched.music + ".\n" +
    "Dialogue — spoken in Indonesian, " + voice.descriptor + ",\n" +
    voice.directive + ", speaking directly to the viewer:\n" +
    '"' + enriched.dialogue + '"\n' +
    "SFX: " + enriched.sfx + ".";

  // Arahan timing untuk scene 10 detik (PRD §6.1 prinsip time-blocking).
  if (scene.duration >= 10) {
    var t1 = Math.round(scene.duration * 0.3);
    var t2 = Math.round(scene.duration * 0.7);
    audio +=
      "\nTiming: [0-" + t1 + "s] establish and speak the opening line; " +
      "[" + t1 + "-" + t2 + "s] show the action; " +
      "[" + t2 + "-" + scene.duration + "s] settle and hold the final beat.";
  }
  blocks.push(audio);

  /* --- Blok 7: ON-SCREEN TEXT & OUTPUT SETTINGS --- */
  blocks.push(
    "[ON-SCREEN TEXT]\n" +
    'Show the text "' + enriched.onscreen + '" in a clean white sans-serif,\n' +
    "bottom-centre, safe from the platform UI overlay, appears at 1 second and\n" +
    "remains until the end of the clip. Text must be spelled exactly as written,\n" +
    "in Indonesian. Do not add any other text."
  );

  blocks.push(
    "[OUTPUT]\n" +
    "Single continuous shot. No scene cuts. No jump cuts.\n" +
    "Duration: " + scene.duration + " seconds · Aspect ratio: " + aspect +
    " · Model: Gemini Omni Flash"
  );

  return blocks.join("\n\n");
};

/* ======================================================================
 * 5. VALIDATOR — 11 checklist PRD §14.B
 * ==================================================================== */
FA.validateScene = function (scene) {
  var p = scene.prompt;
  var checks = [];

  function add(id, label, pass, detail) {
    checks.push({ id: id, label: label, pass: !!pass, detail: detail || "" });
  }

  var required = [
    "[REFERENCE]", "[CONTINUITY LOCK", "[SHOT]", "[SETTING & LIGHTING]",
    "[CAMERA]", "[AUDIO]", "[ON-SCREEN TEXT]", "[OUTPUT]",
  ];
  var missing = required.filter(function (b) { return p.indexOf(b) === -1; });
  add("V1", "Memuat blok wajib", missing.length === 0, missing.join(" "));

  add("V2", "Menyatakan single continuous shot / no jump cuts",
    /single continuous shot/i.test(p) && /no jump cuts/i.test(p));

  add("V3", "Durasi disebutkan", new RegExp("Duration: " + scene.duration + " seconds").test(p));

  add("V4", "Aspect ratio disebutkan", /Aspect ratio: \d+:\d+/.test(p));

  var dialogMatch = p.match(/speaking directly to the viewer:\n"([^"]+)"/);
  var dialogWords = dialogMatch ? FA.countWords(dialogMatch[1]) : 0;
  var budget = FA.wordBudget(scene.duration);
  add("V5", "Dialog dalam tanda kutip ≤ " + budget + " kata (durasi " + scene.duration + "s)",
    !!dialogMatch && dialogWords > 0 && dialogWords <= budget,
    dialogWords + " kata");

  add("V6", "Dialog disertai arahan tone/gender/tempo",
    /Indonesian female voice|Indonesian male voice/i.test(p) &&
    /warm|upbeat|calm|gentle|casual|low,|matter-of-fact/i.test(p));

  var onscreenMatch = p.match(/Show the text "([^"]+)"/);
  var onscreenWords = onscreenMatch ? FA.countWords(onscreenMatch[1]) : 0;
  add("V7", "Teks layar dalam tanda kutip ≤ " + FA.ONSCREEN_MAX_WORDS + " kata",
    !!onscreenMatch && onscreenWords > 0 && onscreenWords <= FA.ONSCREEN_MAX_WORDS,
    onscreenWords + " kata");

  add("V8", "Menyebut nama produk", p.indexOf(scene._productName) !== -1);

  add("V9", "Tidak ada placeholder yang bocor", p.indexOf("{{") === -1);

  // V10 & V11 diperiksa di level project (butuh perbandingan antar scene).
  return checks;
};

/* Cek V10 (continuity identik) & V11 (klaim aman) di level project. */
FA.validateProject = function (project) {
  var all = [];

  project.scenes.forEach(function (s) {
    all = all.concat(FA.validateScene(s));
  });

  // Status validasi per scene
  project.scenes.forEach(function (s) {
    s.validation = FA.validateScene(s);
    s.valid = s.validation.every(function (c) { return c.pass; });
  });

  // V10 — continuity block identik di semua scene
  var blocks = project.scenes.map(function (s) {
    var m = s.prompt.match(/\[CONTINUITY LOCK[^\]]*\]([\s\S]*?)\n\n/);
    return m ? m[1].trim() : "";
  });
  var identical = blocks.length > 0 && blocks.every(function (b) { return b === blocks[0] && b.length > 0; });

  var v10 = { id: "V10", label: "Blok continuity identik kata-per-kata di 6 scene", pass: identical };

  // V11 — tidak ada klaim kesehatan absolut tanpa dasar
  var banned = /menyembuhkan|mengobati|obat segala|100% ampuh|langsung sembuh|tanpa efek samping|dijamin sembuh/i;
  var offenders = project.scenes.filter(function (s) { return banned.test(s.prompt); });
  var v11 = {
    id: "V11", label: "Tidak ada klaim absolut terlarang",
    pass: offenders.length === 0,
    detail: offenders.length ? offenders.map(function (s) { return "Scene " + s.index; }).join(", ") : "",
  };

  // V12 — tidak ada harga di prompt kecuali scene CTA
  var priceRe = /Rp\s?[\d.]+|rupiah/i;
  var priceOffenders = project.scenes.filter(function (s) {
    return s.archetype.id !== "CTA" && priceRe.test(s.prompt);
  });
  var v12 = { id: "V12", label: "Harga hanya muncul di scene CTA", pass: priceOffenders.length === 0 };

  project.projectChecks = [v10, v11, v12];
  project.valid = identical && offenders.length === 0;
  project.passedCount = all.filter(function (c) { return c.pass; }).length;
  project.totalCount = all.length;

  return project;
};

/* ======================================================================
 * ORKESTRASI — generate satu project lengkap
 * ==================================================================== */
FA.generateProject = function (brief, options) {
  options = options || {};
  var seed = options.seed || FA.hashString(
    (brief.productName || "") + (brief.category || "") + Date.now()
  );
  var rng = FA.makeRng(seed);

  var playbook = FA.PLAYBOOKS[brief.category] || FA.PLAYBOOKS.UNIVERSAL;
  var style = FA.STYLES[brief.style] || FA.STYLES[playbook.defaultStyle];
  var voice = FA.VOICES[brief.voice] || FA.VOICES[playbook.defaultVoice];
  var pacing = FA.PACING[brief.pacing] || FA.PACING[playbook.defaultPacing];

  brief.voice = voice;
  brief.aspect = FA.PLATFORMS[brief.platform]
    ? FA.PLATFORMS[brief.platform].aspect
    : FA.DEFAULT_ASPECT;

  /* Slot variables — dipilih sekali agar konsisten di 6 scene. */
  var vars = {
    product: brief.productName || "produk ini",
    category: playbook.label,
    pain: brief.pain || FA.pick(playbook.pains, rng),
    benefit: FA.pick(playbook.benefits, rng),
    usage: FA.pick(playbook.usages, rng),
    time: FA.pick(playbook.times, rng),
    audience: brief.audience || FA.pick(playbook.audiences, rng),
    promo: brief.promo || "promonya masih jalan",
    price: brief.price || "",
    talent: "",
    location: "",
    lighting: "",
  };

  var ct = FA.resolveContinuity(brief, playbook, style, voice);
  vars.talent = ct.talent;
  vars.location = ct.location;
  vars.lighting = ct.lighting;

  var routed = FA.routeScenes(brief, pacing);
  var ctx = { rng: rng, vars: vars };

  var scenes = routed.map(function (scene) {
    var enriched = FA.enrichOffline(scene, ctx);
    scene.enriched = enriched;
    scene.prompt = FA.assemblePrompt(scene, enriched, ct, brief);
    scene._productName = brief.productName || "the product";
    scene.dialogue = enriched.dialogue;
    scene.onscreen = enriched.onscreen;
    return scene;
  });

  var project = {
    id: FA.newId("prj"),
    seed: seed,
    brief: brief,
    playbookId: playbook.id,
    playbookLabel: playbook.label,
    styleId: style.id,
    voiceId: voice.id,
    pacingId: pacing.id,
    continuity: ct,
    vars: vars,
    scenes: scenes,
    totalDuration: scenes.reduce(function (a, s) { return a + s.duration; }, 0),
    createdAt: new Date().toISOString(),
    enrichmentSource: "offline",
  };

  project.caption = FA.buildCaption(project);
  return FA.validateProject(project);
};

/* ======================================================================
 * CAPTION & HASHTAG ENGINE (PRD §5.2 Langkah 4)
 * ==================================================================== */
FA.buildCaption = function (project) {
  var brief = project.brief;
  var pb = FA.PLAYBOOKS[project.playbookId];
  var platform = FA.PLATFORMS[brief.platform] || FA.PLATFORMS.tiktok;
  var rng = FA.makeRng(project.seed ^ 0x5bf03635);

  var product = brief.productName || "produk ini";
  var pain = project.vars.pain;
  var benefit = project.vars.benefit;
  var audience = project.vars.audience;

  /* Tiga varian hook dengan pendekatan psikologis berbeda. */
  var hooks = [
    {
      type: "Curiosity",
      text: "Aku nggak nyangka " + product + " bisa sekeren ini 😳",
    },
    {
      type: "Pain",
      text: "Buat kamu yang masih struggle sama " + pain + ", ini buat kamu.",
    },
    {
      type: "Social Proof",
      text: "Udah banyak yang repeat order " + product + ", dan sekarang aku ngerti kenapa.",
    },
  ];

  var bodies = [
    "Jujur, aku udah cobain banyak tapi baru ini yang beneran kerasa. " +
      benefit.charAt(0).toUpperCase() + benefit.slice(1) + " sejak pemakaian rutin.",
    "Yang bikin aku bertahan: hasilnya " + benefit + ", dan harganya masih masuk akal.",
    "Awalnya aku ragu, tapi setelah dipakai rutin, " + benefit + ". Nggak nyesel sama sekali.",
  ];

  var ctas = {
    tiktok: "Cek keranjang kuning ya, stoknya sering habis 🛒",
    shopee: "Langsung checkout di Shopee, masih ada diskon hari ini 🛍️",
    instagram: "Save dulu postingan ini, link ada di bio ya 🔖",
    youtube: "Link produk ada di deskripsi, jangan lupa subscribe ✨",
  };

  var cta = ctas[platform.id] || ctas.tiktok;
  var body = FA.pick(bodies, rng);

  var selected = project.selectedHook || 0;
  if (selected < 0 || selected >= hooks.length) selected = 0;

  var captionText = FA.composeCaption(hooks, body, cta, selected);

  /* Hashtag: broad + niche + lokal sesuai jumlah platform. */
  var n = platform.hashtagCount;
  var broad = FA.pickMany(pb.hashtags.broad, Math.max(1, Math.ceil(n / 2)), rng);
  var niche = FA.pickMany(pb.hashtags.niche, Math.max(1, Math.floor(n / 2)), rng);
  var local = FA.pickMany(pb.hashtags.local, Math.min(3, Math.max(1, Math.floor(n / 3))), rng);
  var hashtags = broad.concat(niche, local);

  return {
    hooks: hooks,
    caption: captionText,
    body: body,
    cta: cta,
    hashtags: hashtags,
    hashtagNote: platform.hashtagNote,
    platformLabel: platform.label,
    bestTime: platform.bestTime,
    wordCount: FA.countWords(captionText),
    idealWords: platform.idealCaptionWords,
    captionMax: platform.captionMax,
    selectedHook: selected,
  };
};

/* Susun ulang teks caption untuk hook ke-i. Dipakai saat user memilih
 * varian hook lain di tab Caption. */
FA.composeCaption = function (hooks, body, cta, hookIndex) {
  var i = (hookIndex >= 0 && hookIndex < hooks.length) ? hookIndex : 0;
  return [hooks[i].text, "", body, "", cta].join("\n");
};

/* Ganti hook terpilih pada project lalu rakit ulang captionnya. */
FA.selectHook = function (project, hookIndex) {
  var c = project.caption;
  if (!c || !c.hooks) return project;
  var i = (hookIndex >= 0 && hookIndex < c.hooks.length) ? hookIndex : 0;
  c.selectedHook = i;
  c.caption = FA.composeCaption(c.hooks, c.body, c.cta, i);
  c.wordCount = FA.countWords(c.caption);
  project.selectedHook = i;
  return project;
};
