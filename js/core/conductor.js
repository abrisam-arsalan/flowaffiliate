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
 *   4. Prompt Assembler     -> rakit 9 blok
 *   5. Validator            -> 14 pemeriksaan kualitas
 * ========================================================================= */

window.FA = window.FA || {};

/* Kapitalkan huruf pertama tanpa mengubah sisa string. */
FA.capitalize = function (s) {
  s = String(s || "");
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/* Susun deskripsi produk dari data kemasan hasil analisis gambar.
 * Dipakai sebagai cadangan saat model tidak mengirim productDescription
 * dan pengguna tidak mengetik deskripsi sendiri. */
FA.describePackaging = function (packaging) {
  var p = packaging || {};
  var core = [p.color, p.material, p.type].filter(Boolean).join(" ");
  if (!core) return "";
  var desc = (/[aeiou]/i.test(core.charAt(0)) ? "an " : "a ") + core;
  if (p.finish) desc += " with a " + p.finish + " finish";
  return desc;
};

/* Ambil deskripsi visual produk dari sumber terbaik yang tersedia.
 * Urutan: analisis gambar -> ketikan pengguna -> data kemasan.
 * Deskripsi ini TIDAK boleh kosong: tanpa itu model video hanya tahu
 * NAMA produk dan bebas mengarang bentuk, warna, serta materialnya. */
FA.resolveProductDescription = function (brief, analysis) {
  var a = analysis || {};
  return String(
    a.productDescription ||
    (brief && brief.productDescription) ||
    FA.describePackaging(a.packaging) ||
    ""
  ).trim();
};

/* Apakah mode anchor foto aktif? Hanya bila pengguna mengaktifkannya DAN
 * benar-benar ada foto produk — tanpa foto, janji "frame awal" tidak ada
 * barangnya dan hanya akan menyesatkan model video. */
FA.usesPhotoAnchor = function (brief) {
  return !!brief && !!brief.photoAnchor && brief.photoCount > 0;
};

/* Cara foto dipakai di satu scene: "frame" (produk = subjek utama, foto jadi
 * frame awal Frames-to-Video) atau "ingredient" (talent = subjek, foto jadi
 * prop terkunci). Null bila mode anchor tidak aktif. */
FA.anchorModeFor = function (brief, scene) {
  if (!FA.usesPhotoAnchor(brief)) return null;
  return scene.archetype.anchorMode === "frame" ? "frame" : "ingredient";
};

/* Selesaikan audiens: profil (nada, pain, hashtag) + sapaan yang dipakai di
 * dialog & caption. Sapaan SELALU mengikuti ketikan pengguna bila ada —
 * profil hanya disimpulkan untuk gaya bahasa. */
FA.resolveAudience = function (brief, analysis, playbook, rng) {
  var text = String(
    (brief && brief.audience) || (analysis && analysis.suggestedAudience) || ""
  ).trim();

  // Pilihan eksplisit dari selektor menang atas tebakan kata kunci.
  var picked = (brief && brief.audienceId && brief.audienceId !== "custom" &&
    FA.AUDIENCES && FA.AUDIENCES[brief.audienceId])
    ? brief.audienceId
    : FA.matchAudience(text);
  var profile = (FA.AUDIENCES && FA.AUDIENCES[picked]) || FA.AUDIENCES.custom;

  return {
    id: picked,
    profile: profile,
    // Sapaan: ketikan pengguna -> sapaan profil -> kandidat playbook (perilaku lama).
    address: text || profile.address || (playbook ? FA.pick(playbook.audiences, rng) : ""),
  };
};

/* ======================================================================
 * 1. CONTINUITY RESOLVER
 * Membuat SATU objek continuity yang disuntikkan identik ke 6 prompt.
 *
 * Bila ada hasil analisis gambar (brief.analysis), nilai dari analisis
 * DIPRIORITASKAN atas nilai generik playbook — karena analisis melihat
 * produk yang sebenarnya, sedangkan playbook hanya tahu kategorinya.
 * ==================================================================== */
FA.resolveContinuity = function (brief, playbook, style, voice, aud, angle) {
  var c = playbook.continuity;
  var a = brief.analysis || {};

  var keep = brief.keepCharacter && brief.talentOverride
    ? brief.talentOverride
    : c.talent;

  var gradeText = FA.capitalize(c.grade);
  if (style && style.grade) {
    gradeText += ". " + FA.capitalize(style.grade);
  }
  // Mood visual dari analisis menambah karakter warna yang khas produk ini.
  if (a.visualMood) {
    gradeText += ". Overall mood: " + a.visualMood + ".";
  }

  // "Bicara ke siapa" mengubah cara bicara, bukan cuma isi kalimatnya —
  // nada audiens disuntikkan ke arahan suara di blok [AUDIO].
  var voiceDirective = voice.directive;
  if (aud && aud.profile && aud.profile.directive) {
    voiceDirective +=
      ". For " + (aud.address || aud.profile.label) + ", additionally: " + aud.profile.directive;
  }

  return {
    talent: keep,
    wardrobe: a.suggestedWardrobe || c.wardrobe,
    location: a.suggestedSetting || c.location,
    lighting: a.suggestedLighting || c.lighting,
    grade: gradeText,
    // Sudut cerita dikunci sekali dan berlaku untuk 6 scene.
    storyAngle: angle ? angle.title + " — " + angle.directive : "",
    cameraStyle: style && style.camera ? style.camera : "",
    voiceDescriptor: voice.descriptor,
    voiceDirective: voiceDirective,
    productName: brief.productName || "the product",

    /* Kunci utama perbaikan kualitas: deskripsi visual produk.
     * Tanpa ini, model video hanya tahu NAMA produk dan harus menebak
     * bentuk, warna, serta materialnya. */
    productDescription: FA.resolveProductDescription(brief, a),
    labelText: a.labelText || "",
    packaging: a.packaging || null,
  };
};

/* Blok continuity yang ditulis kata-per-kata sama di setiap prompt. */
FA.buildContinuityBlock = function (ct, brief) {
  var lines = [
    "[CONTINUITY LOCK — identical in all 6 scenes, do not alter]",
    "Character: " + ct.talent + ".",
    "Wardrobe: " + ct.wardrobe + ".",
    "Location: " + ct.location + ".",
    "Lighting: " + ct.lighting + ".",
    "Colour grade: " + ct.grade + ".",
  ];

  if (ct.storyAngle) {
    lines.push("Story angle: " + ct.storyAngle + ". Keep this angle across all 6 scenes.");
  }

  lines.push("Keep face, wardrobe, location, lighting and grade IDENTICAL across all scenes.");

  // Deskripsi produk yang konkret membuat model video mengenali bentuk, warna,
  // dan material produk — bukan menebaknya dari nama saja.
  var productLine = "Product: " + ct.productName;
  if (ct.productDescription) {
    productLine += " — " + ct.productDescription;
  }
  productLine += ". Keep the same shape, label and cap in every shot.";
  lines.push(productLine);

  // Produk diperlakukan sebagai prop terkunci — analog FaceLock untuk karakter.
  lines.push(
    "PRODUCTLOCK: this exact product is a locked prop — identical shape, " +
    "colours, cap and label in all 6 scenes."
  );

  if (ct.labelText) {
    lines.push(
      'The product label reads "' + ct.labelText + '" — keep that text exactly as-is.',
    );
  }

  return lines.join("\n");
};

/* Blok kesetiaan produk: aturan anti-drift yang paling diutamakan.
 * Muncul di setiap prompt, tepat setelah deklarasi referensi foto. */
FA.buildProductFidelityBlock = function (ct) {
  var lines = [
    "[PRODUCT FIDELITY — highest priority]",
    "Reproduce the product in the reference photo(s) EXACTLY: the same packaging",
    "shape, proportions, cap/finish, colours, materials and logo as photographed.",
    "Do NOT substitute a generic container, do NOT redesign or \"beautify\" the product,",
    "and do NOT change its size or look between shots.",
    "If the photo(s) and any text description disagree, the PHOTO wins.",
  ];

  // Saat label tidak terbaca, model harus dilarang TEGAS mengarang tulisan —
  // ini sumber paling sering dari produk yang "dikarang".
  if (ct.labelText) {
    lines.push(
      'Render the label text EXACTLY as "' + ct.labelText + '" — same spelling and capitalisation.'
    );
  } else {
    lines.push(
      "If the label is not legible in the photo, leave the label area plain and " +
      "abstract — do NOT invent any brand name, logo or text."
    );
  }

  return lines.join("\n");
};

/* ======================================================================
 * 2. SCENE ROUTER
 * ==================================================================== */
FA.routeScenes = function (brief, pacing, rng, angle) {
  var pick1 = rng
    ? function (arr) { return FA.pick(arr, rng); }
    : function (arr) { return arr[0]; };

  return FA.ARCHETYPE_ORDER.map(function (archId, i) {
    var arch = FA.ARCHETYPES[archId];

    // Varian arc mengubah ISI slotnya (mis. DEMO jadi perbandingan/unboxing),
    // supaya busur 6 scene tidak selalu identik antar generate.
    var variant = (arch.arcVariants && arch.arcVariants.length)
      ? pick1(arch.arcVariants)
      : null;

    // Kandidat dialog Scene 1 bertambah khas hook angle terpilih.
    var pool = arch.dialogueCandidates.slice();
    if (archId === "HOOK" && angle && angle.hookCandidates) {
      pool = pool.concat(angle.hookCandidates);
    }

    return {
      index: i + 1,
      archetype: arch,
      arcVariant: variant,
      commands: (variant ? variant.commands : arch.commands).slice(),
      dialoguePool: pool,
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
  var pool = scene.dialoguePool || arch.dialogueCandidates;
  var fits = pool.filter(function (d) {
    var filled = FA.fill(d, ctx.vars);
    return FA.countWords(filled) <= budget;
  });
  var picked = fits.length ? FA.pick(fits, rng) : pool[0];

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

  // Bank treatment: tiap generate memilih varian shot/setting/camera/sfx/music
  // yang berbeda, dan varian arc bisa menimpa templatenya. Inilah yang paling
  // efektif menurunkan rasa monoton antar produk dalam kategori sama.
  var shotTpl = (scene.arcVariant && scene.arcVariant.shot) ||
    FA.pick(arch.shots || [arch.shot], rng);

  return {
    dialogue: dialogue,
    onscreen: onscreen,
    shot: FA.stripUnfilled(FA.fill(shotTpl, ctx.vars)),
    // Setting dimulai sebagai awal kalimat -> huruf pertama dikapitalkan.
    setting: FA.capitalize(FA.stripUnfilled(FA.fill(FA.pick(arch.settings || [arch.setting], rng), ctx.vars))),
    camera: FA.stripUnfilled(FA.fill(FA.pick(arch.cameras || [arch.camera], rng), ctx.vars)),
    sfx: FA.stripUnfilled(FA.fill(FA.pick(arch.sfxs || [arch.sfx], rng), ctx.vars)),
    music: FA.stripUnfilled(FA.fill(FA.pick(arch.musics || [arch.music], rng), ctx.vars)),
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
  var photos = brief.photoCount > 0 ? brief.photoCount : 1;
  var refLines = ["[REFERENCE]"];
  if (photos > 1) {
    refLines.push(
      "Use the uploaded product photos as the product reference for " + ct.productName + ".",
      "Photo 1 is the primary reference; photos 2–" + photos +
        " show other angles and details of the SAME product.",
      "Treat all " + photos + " photos as one single product and match every detail to them."
    );
  } else {
    refLines.push(
      "Use the uploaded product image as the primary product reference for " +
      ct.productName + "."
    );
  }
  if (ct.productDescription) {
    refLines.push("The product is " + ct.productDescription + ".");
  }

  /* Mode anchor foto: teks hanya bisa "meminta" kesetiaan — foto yang bisa
   * menjaminnya. Scene produk-hero memakai foto sebagai frame awal; scene
   * bertalent memakai foto sebagai prop terkunci. */
  var anchor = FA.anchorModeFor(brief, scene);
  if (anchor === "frame") {
    refLines.push(
      "Anchor mode (Frames-to-Video): the uploaded product photo IS the opening frame",
      "of this clip. Animate from that exact photo — do not redraw, restyle or swap",
      "the product."
    );
  } else if (anchor === "ingredient") {
    refLines.push(
      "Anchor mode (Ingredients-to-Video): treat the uploaded product photo as a locked",
      "prop/ingredient reference — the product must match it pixel-for-pixel in every frame."
    );
  }

  refLines.push(
    brief.hasCharacterRef
      ? "Use the uploaded character photo as the identity reference for the talent."
      : "Use the continuity description below to keep the talent consistent.",
  );
  blocks.push(refLines.join("\n"));

  /* --- Blok 2: PRODUCT FIDELITY --- */
  blocks.push(FA.buildProductFidelityBlock(ct));

  /* --- Blok 3: CONTINUITY LOCK --- */
  blocks.push(FA.buildContinuityBlock(ct, brief));

  /* --- Blok 4: SHOT & SUBJECT --- */
  blocks.push("[SHOT]\n" + enriched.shot);

  /* --- Blok 5: SETTING & LIGHTING --- */
  blocks.push("[SETTING & LIGHTING]\n" + enriched.setting);

  /* --- Blok 6: CAMERA --- */
  blocks.push("[CAMERA]\n" + enriched.camera);

  /* --- Blok 7: AUDIO & DIALOGUE --- */
  var audio =
    "[AUDIO]\n" +
    "Ambience: quiet natural room tone.\n" +
    "Music: " + enriched.music + ".\n" +
    "Dialogue — spoken in Indonesian, " + voice.descriptor + ",\n" +
    (ct.voiceDirective || voice.directive) + ", speaking directly to the viewer:\n" +
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

  /* --- Blok 8: ON-SCREEN TEXT & OUTPUT SETTINGS --- */
  blocks.push(
    "[ON-SCREEN TEXT]\n" +
    'Show the text "' + enriched.onscreen + '" in a clean white sans-serif,\n' +
    "bottom-centre, safe from the platform UI overlay, appears at 1 second and\n" +
    "remains until the end of the clip. Text must be spelled exactly as written,\n" +
    "in Indonesian. Do not add any other text."
  );

  var output =
    "[OUTPUT]\n" +
    "Single continuous shot. No scene cuts. No jump cuts.\n" +
    (anchor === "frame"
      ? "Start from the uploaded product photo as the opening frame.\n"
      : "") +
    "Duration: " + scene.duration + " seconds · Aspect ratio: " + aspect +
    " · Model: Gemini Omni Flash";
  blocks.push(output);

  return blocks.join("\n\n");
};

/* ======================================================================
 * 5. VALIDATOR — pemeriksaan kualitas V1–V14
 * ==================================================================== */
FA.validateScene = function (scene) {
  var p = scene.prompt;
  var checks = [];

  function add(id, label, pass, detail) {
    checks.push({ id: id, label: label, pass: !!pass, detail: detail || "" });
  }

  var required = [
    "[REFERENCE]", "[PRODUCT FIDELITY", "[CONTINUITY LOCK", "[SHOT]",
    "[SETTING & LIGHTING]", "[CAMERA]", "[AUDIO]", "[ON-SCREEN TEXT]", "[OUTPUT]",
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

  // Deskripsi visual produk adalah pertahanan utama dari produk "ngarang":
  // tanpa itu model video hanya tahu nama dan bebas mengarang bentuk kemasan.
  // (ID V13, bukan V10 — V10–V12 sudah dipakai pemeriksaan level project.)
  var descMatch = p.match(/The product is ([^\n]+)/);
  var descWords = descMatch ? FA.countWords(descMatch[1]) : 0;
  add("V13", "Menyebut deskripsi visual produk (bentuk/warna/material)",
    descWords >= 4,
    descWords >= 4 ? descWords + " kata"
      : "kosong — isi kolom Deskripsi tampilan produk atau aktifkan analisis AI");

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

  // V14 — deklarasi mode anchor foto harus konsisten per scene: scene
  // produk-hero wajib menyebut frame awal, scene bertalent wajib menyebut
  // prop terkunci. (ID V14 — V13 dipakai pemeriksaan deskripsi per scene.)
  var anchorOffenders = [];
  if (FA.usesPhotoAnchor(project.brief)) {
    project.scenes.forEach(function (s) {
      var isFrame = s.archetype.anchorMode === "frame";
      var ok = s.prompt.indexOf("Anchor mode") !== -1 &&
        (isFrame
          ? s.prompt.indexOf("Start from the uploaded product photo as the opening frame") !== -1
          : s.prompt.indexOf("prop/ingredient reference") !== -1);
      if (!ok) anchorOffenders.push("Scene " + s.index);
    });
  }
  var v14 = {
    id: "V14",
    label: "Mode anchor foto dinyatakan per scene (frame awal / prop terkunci)",
    pass: anchorOffenders.length === 0,
    detail: anchorOffenders.join(", "),
  };

  project.projectChecks = [v10, v11, v12, v14];
  project.valid = identical && offenders.length === 0 && anchorOffenders.length === 0;
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

  /* Slot variables — dipilih sekali agar konsisten di 6 scene.
   * Bila ada hasil analisis gambar, saran dari analisis dipakai lebih dulu:
   * itu terikat pada produk yang benar-benar difoto, sedangkan daftar
   * playbook bersifat generik untuk seluruh kategori. */
  var analysis = brief.analysis || {};

  /* Audiens: sapaan dari pengguna (atau saran AI), profilnya disimpulkan
   * untuk nada bicara, subset pain, dan hashtag caption. */
  var aud = FA.resolveAudience(brief, analysis, playbook, rng);
  var audPains = (aud.profile && aud.profile.pains) || [];

  /* Hook angle: sudut cerita dipilih SEKALI per project (bisa dipaksa lewat
   * options.hookAngle untuk pengujian/pengaturan), lalu dikunci di 6 scene. */
  var angle = FA.HOOK_ANGLES[
    (options.hookAngle && FA.HOOK_ANGLES[options.hookAngle])
      ? options.hookAngle
      : FA.pick(FA.HOOK_ANGLE_ORDER, rng)
  ];

  var pains = (analysis.suggestedPains && analysis.suggestedPains.length)
    ? analysis.suggestedPains
    : (audPains.length ? audPains : playbook.pains);
  var benefits = (analysis.suggestedBenefits && analysis.suggestedBenefits.length)
    ? analysis.suggestedBenefits
    : playbook.benefits;
  var usages = analysis.usageHint
    ? [analysis.usageHint].concat(playbook.usages)
    : playbook.usages;

  var vars = {
    product: brief.productName || "produk ini",
    category: playbook.label,
    pain: brief.pain || FA.pick(pains, rng),
    benefit: FA.pick(benefits, rng),
    usage: FA.pick(usages, rng),
    time: FA.pick(playbook.times, rng),
    audience: aud.address,
    pronoun: (aud.profile && aud.profile.pronoun) || "kamu",
    promo: brief.promo || "promonya masih jalan",
    price: brief.price || "",
    talent: "",
    location: "",
    lighting: "",
  };

  var ct = FA.resolveContinuity(brief, playbook, style, voice, aud, angle);
  vars.talent = ct.talent;
  vars.location = ct.location;
  vars.lighting = ct.lighting;

  var routed = FA.routeScenes(brief, pacing, rng, angle);
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
    audienceId: aud.id,
    hookAngle: angle,
    continuity: ct,
    vars: vars,
    scenes: scenes,
    totalDuration: scenes.reduce(function (a, s) { return a + s.duration; }, 0),
    createdAt: new Date().toISOString(),
    enrichmentSource: "offline",
    analysis: brief.analysis || null,
    analysisSource: (brief.analysis && brief.analysis.source) || "none",
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

  /* Tiga varian hook dengan pendekatan psikologis berbeda.
   * `audience` disisipkan nyata ke hook Pain dan salah satu body —
   * dulu variabelnya ada tapi tidak pernah dipakai. */
  var hooks = [
    {
      type: "Curiosity",
      text: "Aku nggak nyangka " + product + " bisa sekeren ini 😳",
    },
    {
      type: "Pain",
      text: "Buat " + audience + " yang masih struggle sama " + pain + ", ini buat kamu.",
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
    "Awalnya aku ragu, tapi setelah dipakai rutin, " + benefit +
      ". Nyesel nggak dari dulu — apalagi buat " + audience + ".",
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

  /* Hashtag: broad + niche + lokal sesuai jumlah platform, plus satu tag
   * audiens supaya caption terasa menyapa komunitasnya. */
  var n = platform.hashtagCount;
  var broad = FA.pickMany(pb.hashtags.broad, Math.max(1, Math.ceil(n / 2)), rng);
  var niche = FA.pickMany(pb.hashtags.niche, Math.max(1, Math.floor(n / 2)), rng);
  var local = FA.pickMany(pb.hashtags.local, Math.min(3, Math.max(1, Math.floor(n / 3))), rng);
  var audProfile = (FA.AUDIENCES && FA.AUDIENCES[project.audienceId]) || null;
  var audTags = (audProfile && audProfile.hashtags && audProfile.hashtags.length)
    ? FA.pickMany(audProfile.hashtags, 1, rng)
    : [];
  var hashtags = broad.concat(niche, local, audTags);

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
