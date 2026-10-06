/* =========================================================================
 * FlowAffiliate — Renderer
 * Semua fungsi yang mengubah data project menjadi HTML.
 * ========================================================================= */

window.FA = window.FA || {};

/* ----------------------------------------------------------- Scene cards */
FA.renderScenes = function (project) {
  var html = "";

  project.scenes.forEach(function (s) {
    var failed = (s.validation || []).filter(function (c) { return !c.pass; });
    var checksHtml = (s.validation || []).map(function (c) {
      return '<div class="check ' + (c.pass ? "pass" : "fail") + '">' +
        '<span class="mk">' + (c.pass ? "✓" : "✗") + "</span>" +
        "<span>" + FA.esc(c.label) +
        (c.detail ? ' <span class="dt">(' + FA.esc(c.detail) + ")</span>" : "") +
        "</span></div>";
    }).join("");

    var cmdHtml = s.commands.map(function (c) {
      var info = FA.lookupCommand(c);
      var title = info ? info.fn : "";
      return '<span class="cmd" title="' + FA.esc(title) + '">' + FA.esc(c) + "</span>";
    }).join("");

    html +=
      '<article class="scene" data-scene="' + s.index + '">' +
        '<div class="scene-head">' +
          '<span class="scene-num">' + s.index + "</span>" +
          '<span class="scene-tag">' + FA.esc(s.archetype.label) + "</span>" +
          '<div class="scene-meta">' +
            '<span class="pill">' + s.duration + "s</span>" +
            '<span class="pill ' + (failed.length ? "warn" : "ok") + '">' +
              (failed.length ? failed.length + " gagal" : "Lolos " + (s.validation || []).length + "/" + (s.validation || []).length) +
            "</span>" +
          "</div>" +
        "</div>" +

        /* Prompt */
        '<div class="block">' +
          '<div class="block-head">' +
            '<span class="block-label">📋 Prompt — copy ke Google Flow</span>' +
            '<span>' +
              '<button class="btn btn-ghost btn-sm" data-copy="prompt" data-i="' + s.index + '">Copy</button> ' +
              '<button class="btn btn-ghost btn-sm" data-regen="' + s.index + '" title="Tulis ulang scene ini">🔄</button>' +
            "</span>" +
          "</div>" +
          '<div class="prompt-box">' + FA.esc(s.prompt) + "</div>" +
        "</div>" +

        /* Narasi */
        '<div class="block">' +
          '<div class="block-head">' +
            '<span class="block-label">🎙️ Narasi (Voice-Over Indonesia)</span>' +
            '<button class="btn btn-ghost btn-sm" data-copy="narration" data-i="' + s.index + '">Copy</button>' +
          "</div>" +
          '<div class="quote">"' + FA.esc(s.dialogue) + '"</div>' +
        "</div>" +

        /* Teks layar */
        '<div class="block">' +
          '<div class="block-head">' +
            '<span class="block-label">💬 Teks di layar</span>' +
            '<button class="btn btn-ghost btn-sm" data-copy="onscreen" data-i="' + s.index + '">Copy</button>' +
          "</div>" +
          '<div class="quote text-overlay">' + FA.esc(s.onscreen) + "</div>" +
        "</div>" +

        /* Validasi */
        '<div class="block">' +
          '<div class="block-head"><span class="block-label">Pemeriksaan kualitas</span></div>' +
          '<div class="checks">' + checksHtml + "</div>" +
        "</div>" +

        /* Footer */
        '<div class="scene-foot">' +
          '<span><strong>Tujuan:</strong> ' + FA.esc(s.archetype.purpose) + "</span>" +
          '<span class="cmd-list">' + cmdHtml + "</span>" +
        "</div>" +
      "</article>";
  });

  return html;
};

/* ---------------------------------------------------------- Caption tab */
FA.renderCaption = function (project) {
  var c = project.caption;
  var selected = c.selectedHook || 0;

  var hooksHtml = c.hooks.map(function (h, i) {
    return '<div class="hook' + (i === selected ? " is-selected" : "") + '" data-hook="' + i + '">' +
      '<div class="hook-type">' + FA.esc(h.type) + "</div>" +
      '<div class="hook-text">' + FA.esc(h.text) + "</div>" +
      '<button class="btn btn-ghost btn-sm" data-usehook="' + i + '">' +
        (i === selected ? "✓ Dipakai" : "Pakai hook ini") + "</button>" +
      "</div>";
  }).join("");

  var tagsHtml = c.hashtags.map(function (t) {
    return '<span class="tag">' + FA.esc(t) + "</span>";
  }).join("");

  var idealOk = c.wordCount >= c.idealWords[0] && c.wordCount <= c.idealWords[1];

  return (
    '<div class="card">' +
      '<h2 class="card-title">3 Varian Hook — pilih satu</h2>' +
      '<p class="muted">Tiap hook memakai pendekatan psikologis berbeda. Klik untuk menyalin.</p>' +
      '<div class="hook-grid">' + hooksHtml + "</div>" +
    "</div>" +

    '<div class="card">' +
      '<div class="block-head">' +
        '<h2 class="card-title" style="margin:0">Caption lengkap — ' + FA.esc(c.platformLabel) + "</h2>" +
        '<button class="btn btn-secondary btn-sm" data-copyfull="1">Copy caption</button>' +
      "</div>" +
      '<p class="muted">' + c.wordCount + " kata · target ideal " + c.idealWords[0] + "–" + c.idealWords[1] +
        " kata " + (idealOk ? '<span class="pill ok">pas</span>' : '<span class="pill warn">perlu disesuaikan</span>') +
      "</p>" +
      '<div class="caption-box" id="captionBox">' + FA.esc(c.caption) + "</div>" +
    "</div>" +

    '<div class="card">' +
      '<div class="block-head">' +
        '<h2 class="card-title" style="margin:0">Hashtag (' + c.hashtags.length + ")</h2>" +
        '<button class="btn btn-secondary btn-sm" data-copytags="1">Copy hashtag</button>' +
      "</div>" +
      '<div class="tag-cloud">' + tagsHtml + "</div>" +
      '<p class="hint">' + FA.esc(c.hashtagNote) + "</p>" +
      '<p class="hint">Estimasi jam posting terbaik: <strong>' + FA.esc(c.bestTime) + "</strong></p>" +
    "</div>" +

    '<div class="card">' +
      '<div class="block-head">' +
        '<h2 class="card-title" style="margin:0">Ajakan (CTA)</h2>' +
        '<button class="btn btn-secondary btn-sm" data-copycta="1">Copy CTA</button>' +
      "</div>" +
      '<div class="quote">' + FA.esc(c.cta) + "</div>" +
    "</div>"
  );
};

/* -------------------------------------------------------- Flow guide tab */
FA.renderFlowTab = function (project) {
  var b = project.brief;
  var platform = FA.PLATFORMS[b.platform] || FA.PLATFORMS.tiktok;

  /* Mode anchor foto mengubah cara pakai di Flow: scene produk-hero dibuat
   * lebih dulu dari foto (Frames to Video), baru scene bertalent. */
  var anchorOn = FA.usesPhotoAnchor(b);
  var heroIdx = [];
  var talentIdx = [];
  project.scenes.forEach(function (s) {
    (s.archetype.anchorMode === "frame" ? heroIdx : talentIdx).push(s.index);
  });

  var modeStat = anchorOn ? "Frames + Ingredients" : "Ingredients";

  var stepUpload = anchorOn
    ? "<li><strong>Langkah 1 — scene produk-hero (Scene " + heroIdx.join(", ") + ")</strong>: " +
      "pilih mode <strong>Frames to Video</strong>, jadikan foto produk sebagai " +
      "<em>frame awal</em>, set durasi lalu generate. Videonya dimulai dari fotonya, " +
      "jadi produk dijamin persis.</li>" +
      "<li><strong>Langkah 2 — scene bertalent (Scene " + talentIdx.join(", ") + ")</strong>: " +
      "pindah ke mode <strong>Ingredients to Video</strong>, upload semua foto produk " +
      "sebagai prop terkunci" + (b.hasCharacterRef ? " + foto karakter untuk wajah" : "") +
      ". Kalau produknya masih meleset, perbaiki lewat obrolan di Flow sambil merujuk " +
      "klip hero tadi.</li>"
    : "<li>Pilih mode <strong>Ingredients to Video</strong>, upload semua foto produk" +
      (b.hasCharacterRef ? " + foto karakter" : "") + ".</li>";

  var stepCopy = anchorOn
    ? "<li>Copy prompt tiap scene, paste, set durasinya. Disarankan kerjakan scene hero " +
      "lebih dulu supaya patokan produknya kebentuk sebelum scene bertalent.</li>"
    : "<li>Copy prompt <strong>Scene 1</strong>, paste, set durasi <strong>" +
      project.scenes[0].duration + " detik</strong>, generate.</li>";

  return (
    '<div class="card">' +
      '<h2 class="card-title">Setelan yang harus kamu pilih di Google Flow</h2>' +
      '<div class="stat-grid">' +
        '<div class="stat"><div class="stat-num" style="font-size:.95rem">Omni Flash</div><div class="stat-lbl">Model</div></div>' +
        '<div class="stat"><div class="stat-num" style="font-size:.95rem">' + FA.esc(b.aspect) + '</div><div class="stat-lbl">Aspect ratio</div></div>' +
        '<div class="stat"><div class="stat-num" style="font-size:.95rem">' + FA.esc(modeStat) + '</div><div class="stat-lbl">Mode</div></div>' +
        '<div class="stat"><div class="stat-num">' + project.totalDuration + '</div><div class="stat-lbl">Total detik</div></div>' +
        '<div class="stat"><div class="stat-num">6</div><div class="stat-lbl">Klip</div></div>' +
      "</div>" +
    "</div>" +

    '<div class="card">' +
      '<h2 class="card-title">Langkah demi langkah</h2>' +
      '<ol class="guide-list">' +
        "<li>Buka <code>labs.google/fx/tools/flow</code> dan buat project baru.</li>" +
        "<li>Set model <strong>Gemini Omni Flash</strong>, aspect ratio <strong>" + FA.esc(b.aspect) + "</strong>.</li>" +
        stepUpload +
        stepCopy +
        "<li>Ulangi untuk scene sisanya. Blok continuity sudah identik sehingga karakter konsisten.</li>" +
        "<li>Gabungkan 6 klip, tambahkan musik, lalu upload ke <strong>" + FA.esc(platform.label) + "</strong>.</li>" +
        "<li>Pakai caption dan hashtag dari tab <strong>Caption &amp; Hashtag</strong>.</li>" +
      "</ol>" +
    "</div>" +

    '<div class="card">' +
      '<h2 class="card-title">Narasi lengkap (untuk dubbing / subtitle)</h2>' +
      '<p class="muted">Kalau audio dari Flow kurang memuaskan, pakai naskah ini untuk TTS atau subtitle.</p>' +
      '<div class="prompt-box" id="fullNarration">' +
        project.scenes.map(function (s) {
          return "Scene " + s.index + ": \"" + s.dialogue + "\"";
        }).join("\n") +
      "</div>" +
      '<div class="btn-row" style="margin-top:.6rem">' +
        '<button class="btn btn-secondary btn-sm" id="copyNarrationBtn">Copy semua narasi</button>' +
        '<button class="btn btn-ghost btn-sm" id="copySrtBtn">Copy sebagai SRT</button>' +
      "</div>" +
    "</div>"
  );
};

/* ------------------------------------------------------- SRT generation */
FA.buildSRT = function (project) {
  function ts(sec) {
    var h = Math.floor(sec / 3600);
    var m = Math.floor((sec % 3600) / 60);
    var s = Math.floor(sec % 60);
    var ms = Math.round((sec - Math.floor(sec)) * 1000);
    return ("0" + h).slice(-2) + ":" + ("0" + m).slice(-2) + ":" +
           ("0" + s).slice(-2) + "," + ("00" + ms).slice(-3);
  }

  var out = [];
  var t = 0;
  project.scenes.forEach(function (s) {
    out.push(String(s.index));
    out.push(ts(t) + " --> " + ts(t + s.duration));
    out.push(s.dialogue);
    out.push("");
    t += s.duration;
  });
  return out.join("\n");
};

/* ------------------------------------------------------------ Library */
FA.renderLibrary = function () {
  var list = FA.Store.all();
  var grid = document.getElementById("libGrid");
  var note = document.getElementById("libNote");

  if (!list.length) {
    grid.innerHTML =
      '<div class="empty"><div class="empty-icon">📚</div>' +
      "<p>Belum ada project tersimpan.</p>" +
      "<p>Generate paket prompt lalu pilih <strong>Simpan ke Library</strong>.</p></div>";
    note.textContent = "";
    return;
  }

  note.textContent = list.length + " project tersimpan di browser ini.";

  grid.innerHTML = list.map(function (p) {
    var when = new Date(p.createdAt).toLocaleString("id-ID");
    return '<div class="lib-card" data-id="' + FA.esc(p.id) + '">' +
      "<h3>" + FA.esc(p.productName || "(tanpa nama)") + "</h3>" +
      '<div class="lib-meta">' + FA.esc(p.playbookLabel) + " · " + FA.esc(p.platformLabel) +
        " · " + p.sceneCount + " scene · " + p.totalDuration + "s<br />" + FA.esc(when) + "</div>" +
      '<div class="btn-row">' +
        '<button class="btn btn-secondary btn-sm" data-lib-open="' + FA.esc(p.id) + '">Buka</button>' +
        '<button class="btn btn-ghost btn-sm" data-lib-del="' + FA.esc(p.id) + '">Hapus</button>' +
      "</div>" +
    "</div>";
  }).join("");
};

/* -------------------------------------------------------------- Stats */
FA.renderDbStats = function () {
  var el = document.getElementById("dbStats");
  if (!el) return;

  var ugc = FA.COMMANDS.ugc.length;
  var ad = FA.COMMANDS.ad.length;
  var lock = FA.COMMANDS.lock.length;

  var stats = [
    { n: ugc + ad + lock, l: "Total command" },
    { n: ugc, l: "Command UGC" },
    { n: ad, l: "Command iklan" },
    { n: lock, l: "Command continuity" },
    { n: FA.PLAYBOOK_ORDER.length, l: "Playbook kategori" },
    { n: FA.ARCHETYPE_ORDER.length, l: "Arketipe scene" },
  ];

  el.innerHTML = stats.map(function (s) {
    return '<div class="stat"><div class="stat-num">' + s.n +
           '</div><div class="stat-lbl">' + s.l + "</div></div>";
  }).join("");
};
