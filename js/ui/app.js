/* =========================================================================
 * FlowAffiliate — App Controller
 * Mengatur state, wizard, event, dan orkestrasi generate.
 * ========================================================================= */

window.FA = window.FA || {};

FA.App = {
  state: {
    view: "wizard",
    step: 1,
    files: [],
    project: null,
    selectedHook: 0,
    busy: false,
  },

  /* ==================================================== INIT & BOOTSTRAP */
  init: function () {
    FA.App.populateSelects();
    FA.App.bindNav();
    FA.App.bindUpload();
    FA.App.bindBrief();
    FA.App.bindWizard();
    FA.App.bindResultActions();
    FA.App.bindSettings();
    FA.App.bindTabs();
    // Sinkronkan gaya/suara/pacing dengan default playbook kategori terpilih
    // sejak awal, supaya nilai di form tidak menyesatkan sebelum user mengubah apa pun.
    FA.App.onCategoryChange(false);
    FA.App.setStep(1);
    FA.renderDbStats();
    FA.App.loadKeyIntoField();

    // Demo shortcut: ?demo=1 langsung generate contoh.
    var params = new URLSearchParams(location.search);
    if (params.get("demo") === "1") {
      setTimeout(function () { FA.App.runDemo(); }, 120);
    }
  },

  /* ------------------------------------------------------- Select options */
  populateSelects: function () {
    var cat = document.getElementById("fCategory");
    cat.innerHTML = FA.PLAYBOOK_ORDER.map(function (id) {
      var p = FA.PLAYBOOKS[id];
      return '<option value="' + id + '">' + p.icon + " " + FA.esc(p.label) + "</option>";
    }).join("");

    var plat = document.getElementById("fPlatform");
    plat.innerHTML = ["tiktok", "shopee", "instagram", "youtube"].map(function (id) {
      return '<option value="' + id + '">' + FA.esc(FA.PLATFORMS[id].label) + "</option>";
    }).join("");

    var pace = document.getElementById("fPacing");
    pace.innerHTML = ["cepat", "standar", "lengkap"].map(function (id) {
      var p = FA.PACING[id];
      return '<option value="' + id + '"' + (id === "standar" ? " selected" : "") + ">" +
        p.label + " — " + p.durations.reduce(function (a, b) { return a + b; }, 0) + "s (" +
        p.durations.join("/") + ")</option>";
    }).join("");

    var sty = document.getElementById("fStyle");
    sty.innerHTML = Object.keys(FA.STYLES).map(function (id) {
      return '<option value="' + id + '">' + FA.esc(FA.STYLES[id].label) + "</option>";
    }).join("");

    var voi = document.getElementById("fVoice");
    voi.innerHTML = Object.keys(FA.VOICES).map(function (id) {
      var v = FA.VOICES[id];
      return '<option value="' + id + '">' + FA.esc(v.label) + " (" +
        (v.gender === "female" ? "wanita" : "pria") + ")</option>";
    }).join("");
  },

  /* ------------------------------------------------------------- Nav */
  bindNav: function () {
    document.querySelectorAll(".navlink").forEach(function (btn) {
      btn.addEventListener("click", function () {
        FA.App.showView(btn.dataset.view);
      });
    });
    document.getElementById("brandBtn").addEventListener("click", function () {
      FA.App.showView("wizard");
    });
    document.getElementById("libGrid").addEventListener("click", function (e) {
      var openBtn = e.target.closest("[data-lib-open]");
      var delBtn = e.target.closest("[data-lib-del]");
      if (openBtn) FA.App.openFromLibrary(openBtn.dataset.libOpen);
      if (delBtn) {
        FA.Store.remove(delBtn.dataset.libDel);
        FA.renderLibrary();
        FA.App.toast("Project dihapus", "ok");
      }
    });
    document.getElementById("clearLibBtn").addEventListener("click", function () {
      if (confirm("Hapus semua project di library? Tindakan ini tidak bisa dibatalkan.")) {
        FA.Store.clear();
        FA.renderLibrary();
        FA.App.toast("Library dikosongkan", "ok");
      }
    });
  },

  showView: function (view) {
    ["wizard", "library", "guide", "settings"].forEach(function (v) {
      document.getElementById("view-" + v).classList.toggle("hidden", v !== view);
    });
    document.querySelectorAll(".navlink").forEach(function (b) {
      b.classList.toggle("is-active", b.dataset.view === view);
    });
    if (view === "library") FA.renderLibrary();
    if (view === "settings") { FA.renderDbStats(); FA.App.loadKeyIntoField(); }
    FA.App.state.view = view;
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  /* ------------------------------------------------------ File upload */
  bindUpload: function () {
    var dz = document.getElementById("dropzone");
    var input = document.getElementById("fileInput");

    dz.addEventListener("click", function () { input.click(); });
    dz.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); }
    });
    input.addEventListener("change", function () {
      FA.App.addFiles(input.files);
      input.value = "";
    });

    ["dragenter", "dragover"].forEach(function (ev) {
      dz.addEventListener(ev, function (e) {
        e.preventDefault(); dz.classList.add("is-over");
      });
    });
    ["dragleave", "drop"].forEach(function (ev) {
      dz.addEventListener(ev, function (e) {
        e.preventDefault(); dz.classList.remove("is-over");
      });
    });
    dz.addEventListener("drop", function (e) {
      if (e.dataTransfer && e.dataTransfer.files) FA.App.addFiles(e.dataTransfer.files);
    });

    document.getElementById("demoBtn").addEventListener("click", function () {
      FA.App.runDemo();
    });
  },

  addFiles: function (fileList) {
    var accepted = [];
    Array.prototype.forEach.call(fileList, function (f) {
      if (FA.App.state.files.length + accepted.length >= 5) return;
      if (!/^image\/|^video\//.test(f.type)) return;
      if (f.size > 10 * 1024 * 1024) {
        FA.App.toast("File " + f.name + " lebih dari 10 MB, dilewati", "err");
        return;
      }
      accepted.push(f);
    });
    FA.App.state.files = FA.App.state.files.concat(accepted);
    if (accepted.length) {
      FA.App.renderThumbs();
      FA.App.toast(accepted.length + " file ditambahkan", "ok");
    }
    FA.App.refreshGenerateState();
  },

  renderThumbs: function () {
    var wrap = document.getElementById("thumbs");
    wrap.innerHTML = FA.App.state.files.map(function (f, i) {
      var url = URL.createObjectURL(f);
      var media = /^video\//.test(f.type)
        ? '<video src="' + url + '" muted></video>'
        : '<img src="' + url + '" alt="" />';
      return '<div class="thumb">' + media +
        '<button type="button" data-rm="' + i + '" title="Hapus">✕</button></div>';
    }).join("");

    wrap.querySelectorAll("[data-rm]").forEach(function (b) {
      b.addEventListener("click", function () {
        FA.App.state.files.splice(Number(b.dataset.rm), 1);
        FA.App.renderThumbs();
        FA.App.refreshGenerateState();
      });
    });
  },

  /* ----------------------------------------------------------- Brief */
  bindBrief: function () {
    var nameEl = document.getElementById("fName");
    var catEl = document.getElementById("fCategory");

    // Auto-deteksi kategori dari nama produk saat user selesai mengetik.
    nameEl.addEventListener("blur", function () {
      if (!nameEl.value.trim()) return;
      var detected = FA.detectPlaybook(nameEl.value);
      if (detected !== catEl.value) {
        catEl.value = detected;
        FA.App.onCategoryChange(false);
        FA.App.toast("Kategori terdeteksi: " + FA.PLAYBOOKS[detected].label, "ok");
      }
    });

    catEl.addEventListener("change", function () { FA.App.onCategoryChange(true); });
    nameEl.addEventListener("input", FA.App.refreshGenerateState);

    var advEls = ["fPain", "fAudience", "fPrice", "fPromo"];
    advEls.forEach(function (id) {
      document.getElementById(id).addEventListener("input", FA.App.refreshGenerateState);
    });
  },

  /* Saat kategori berubah, sesuaikan gaya & suara default playbook. */
  onCategoryChange: function (userInitiated) {
    var pb = FA.PLAYBOOKS[document.getElementById("fCategory").value];
    if (!pb) return;
    document.getElementById("fStyle").value = pb.defaultStyle;
    document.getElementById("fVoice").value = pb.defaultVoice;
    document.getElementById("fPacing").value = pb.defaultPacing;
    document.getElementById("categoryHint").textContent =
      pb.icon + " " + pb.label + " — playbook dengan " + pb.pains.length +
      " variasi masalah dan " + pb.benefits.length + " manfaat. Gaya visual diset ke " +
      FA.STYLES[pb.defaultStyle].label + ".";
    if (userInitiated) {
      // Isi otomatis contoh masalah agar user punya bayangan.
      var painEl = document.getElementById("fPain");
      if (!painEl.value) painEl.placeholder = "cth: " + pb.pains[0];
    }
    FA.App.refreshGenerateState();
  },

  refreshGenerateState: function () {
    var name = document.getElementById("fName").value.trim();
    var hasFile = FA.App.state.files.length > 0 || FA.App.state.demoMode;
    var ok = name.length > 0 && hasFile;
    document.getElementById("generateBtn").disabled = !ok || FA.App.state.busy;

    var hint = document.getElementById("genHint");
    if (!name && !hasFile) hint.textContent = "Isi nama produk dan upload minimal 1 gambar.";
    else if (!name) hint.textContent = "Nama produk masih kosong.";
    else if (!hasFile) hint.textContent = "Upload minimal 1 gambar produk.";
    else hint.textContent = "Siap. Prompt akan dibuat untuk " + name + ".";
  },

  /* --------------------------------------------------------- Wizard */
  bindWizard: function () {
    document.getElementById("generateBtn").addEventListener("click", function () {
      FA.App.generate();
    });
  },

  setStep: function (n) {
    FA.App.state.step = n;
    [1, 2, 3].forEach(function (i) {
      var panel = document.getElementById("panel-" + i);
      if (panel) panel.classList.toggle("hidden", i !== n);
    });
    document.querySelectorAll("#stepper .step").forEach(function (el) {
      var i = Number(el.dataset.step);
      el.classList.toggle("is-active", i === n);
      el.classList.toggle("is-done", i < n);
    });
  },

  /* -------------------------------------------------------- GENERATE */
  generate: function () {
    if (FA.App.state.busy) return;

    var brief = {
      productName: document.getElementById("fName").value.trim(),
      category: document.getElementById("fCategory").value,
      platform: document.getElementById("fPlatform").value,
      pacing: document.getElementById("fPacing").value,
      style: document.getElementById("fStyle").value,
      voice: document.getElementById("fVoice").value,
      pain: document.getElementById("fPain").value.trim(),
      audience: document.getElementById("fAudience").value.trim(),
      price: document.getElementById("fPrice").value.trim(),
      promo: document.getElementById("fPromo").value.trim(),
      hasCharacterRef: document.getElementById("fCharRef").checked,
    };

    if (!brief.productName) {
      FA.App.toast("Isi nama produk dulu", "err");
      return;
    }

    FA.App.state.busy = true;
    FA.App.refreshGenerateState();
    FA.App.setStep(2);
    FA.App.runProgress();

    // Beri kesempatan browser menggambar UI sebelum kerja sinkron.
    setTimeout(function () {
      var project = FA.generateProject(brief, {});
      FA.App.state.project = project;

      // Fase AI enrichment (opsional). Kalau tidak ada key -> langsung render.
      if (FA.AI.isEnabled()) {
        FA.App.markProgress(5, true);
        document.getElementById("progressTitle").textContent = "Menulis ulang narasi dengan AI…";
        document.getElementById("progressSub").textContent =
          "Gemini menyempurnakan dialog dan teks layar.";
        FA.AI.enrich(project).then(function (enriched) {
          var finalProject = enriched || FA.App.state.project;
          FA.App.finishGenerate(finalProject, !!enriched);
        });
      } else {
        FA.App.finishGenerate(project, false);
      }
    }, 120);
  },

  runProgress: function () {
    var items = document.querySelectorAll("#progressList li");
    items.forEach(function (li) { li.className = ""; });
    FA.App.progressTimer = 0;

    var steps = [
      { t: "Menganalisis produk…", s: "Membaca kategori dan menyiapkan slot konten." },
      { t: "Memilih playbook…", s: "Menyesuaikan dengan kategori produk kamu." },
      { t: "Menyusun continuity lock…", s: "Mengunci wajah, pakaian, dan lokasi untuk 6 scene." },
      { t: "Merakit 6 prompt scene…", s: "Menggabungkan 7 blok wajib per scene." },
      { t: "Memvalidasi kualitas…", s: "Memeriksa 12 pemeriksaan otomatis." },
    ];

    FA.App.progressTimers = [];
    steps.forEach(function (step, i) {
      FA.App.progressTimers.push(setTimeout(function () {
        document.getElementById("progressTitle").textContent = step.t;
        document.getElementById("progressSub").textContent = step.s;
        FA.App.markProgress(i + 1, false);
      }, i * 260));
    });
  },

  markProgress: function (n, doneAll) {
    document.querySelectorAll("#progressList li").forEach(function (li) {
      var i = Number(li.dataset.p);
      li.className = i < n ? "is-done" : i === n ? (doneAll ? "is-done" : "is-doing") : "";
    });
  },

  finishGenerate: function (project, usedAI) {
    FA.App.clearProgressTimers();
    FA.App.state.busy = false;

    document.querySelectorAll("#progressList li").forEach(function (li) {
      li.className = "is-done";
    });

    FA.App.renderResults(project);
    FA.App.setStep(3);
    FA.App.refreshGenerateState();

    FA.App.toast(
      usedAI
        ? "6 prompt siap — narasi diperkaya AI"
        : "6 prompt siap dipakai di Google Flow",
      "ok"
    );
  },

  clearProgressTimers: function () {
    (FA.App.progressTimers || []).forEach(clearTimeout);
    FA.App.progressTimers = [];
  },

  /* --------------------------------------------------------- RESULTS */
  renderResults: function (project) {
    var b = project.brief;

    document.getElementById("resTitle").textContent = b.productName || "Paket Prompt";

    var failedTotal = project.scenes.reduce(function (a, s) {
      return a + (s.validation || []).filter(function (c) { return !c.pass; }).length;
    }, 0);
    var allChecks = project.scenes.reduce(function (a, s) {
      return a + (s.validation || []).length;
    }, 0) + (project.projectChecks || []).length;
    var projFailed = (project.projectChecks || []).filter(function (c) { return !c.pass; }).length;

    var pills = [
      '<span class="pill">' + FA.esc(project.playbookLabel) + "</span>",
      '<span class="pill">' + FA.esc(FA.PLATFORMS[b.platform].label) + "</span>",
      '<span class="pill">' + project.totalDuration + "s · 6 scene</span>",
      '<span class="pill">' + FA.esc(b.aspect) + "</span>",
      '<span class="pill">' + FA.esc(b.voice.label) + "</span>",
      '<span class="pill ' + ((failedTotal + projFailed) === 0 ? "ok" : "warn") + '">' +
        (allChecks - failedTotal - projFailed) + "/" + allChecks + " pemeriksaan lolos</span>",
    ];
    if (project.enrichmentSource === "ai") {
      pills.push('<span class="pill ai">Narasi diperkaya AI</span>');
    }
    if (project.fromLibrary) {
      pills.push('<span class="pill">dari library</span>');
    }
    document.getElementById("resPills").innerHTML = pills.join("");

    document.getElementById("tab-prompts").innerHTML = FA.renderScenes(project);
    document.getElementById("tab-caption").innerHTML = FA.renderCaption(project);
    document.getElementById("tab-flow").innerHTML = FA.renderFlowTab(project);

    FA.App.selectTab("prompts");
  },

  /* --------------------------------------------------- RESULT ACTIONS */
  bindResultActions: function () {
    // Copy per blok & regenerate per scene (delegasi event).
    document.getElementById("tab-prompts").addEventListener("click", function (e) {
      var copyBtn = e.target.closest("[data-copy]");
      var regenBtn = e.target.closest("[data-regen]");

      if (copyBtn) {
        var idx = Number(copyBtn.dataset.i);
        var kind = copyBtn.dataset.copy;
        var scene = FA.App.state.project.scenes.filter(function (s) { return s.index === idx; })[0];
        if (!scene) return;
        var text = kind === "prompt" ? scene.prompt
          : kind === "narration" ? scene.dialogue
          : scene.onscreen;
        FA.App.copy(text, copyBtn);
      }

      if (regenBtn) {
        FA.App.regenScene(Number(regenBtn.dataset.regen));
      }
    });

    // Tombol caption.
    document.getElementById("tab-caption").addEventListener("click", function (e) {
      var useBtn = e.target.closest("[data-usehook]");
      var fullBtn = e.target.closest("[data-copyfull]");
      var tagsBtn = e.target.closest("[data-copytags]");
      var ctaBtn = e.target.closest("[data-copycta]");
      var c = FA.App.state.project.caption;

      // Memilih hook akan menyusun ulang caption dan menandai kartu terpilih.
      if (useBtn) {
        var idx = Number(useBtn.dataset.usehook);
        FA.selectHook(FA.App.state.project, idx);
        FA.App.renderResults(FA.App.state.project);
        FA.App.selectTab("caption");
        FA.App.toast("Hook " + FA.esc(c.hooks[idx].type) + " dipakai di caption", "ok");
        return;
      }
      if (fullBtn) FA.App.copy(c.caption, fullBtn);
      if (tagsBtn) FA.App.copy(c.hashtags.join(" "), tagsBtn);
      if (ctaBtn) FA.App.copy(c.cta, ctaBtn);
    });

    // Tombol di tab Flow.
    document.getElementById("tab-flow").addEventListener("click", function (e) {
      if (e.target.id === "copyNarrationBtn") {
        var txt = FA.App.state.project.scenes.map(function (s) {
          return "Scene " + s.index + ": \"" + s.dialogue + "\"";
        }).join("\n");
        FA.App.copy(txt, e.target);
      }
      if (e.target.id === "copySrtBtn") {
        FA.App.copy(FA.buildSRT(FA.App.state.project), e.target);
      }
    });

    document.getElementById("copyAllBtn").addEventListener("click", function (e) {
      var pkg = FA.buildExportPackage(FA.App.state.project);
      FA.App.copy(pkg, e.target);
    });

    // Menu titik-tiga.
    var moreBtn = document.getElementById("moreBtn");
    var moreMenu = document.getElementById("moreMenu");
    moreBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = moreMenu.classList.toggle("hidden");
      moreBtn.setAttribute("aria-expanded", String(!open));
    });
    document.addEventListener("click", function () {
      moreMenu.classList.add("hidden");
      moreBtn.setAttribute("aria-expanded", "false");
    });
    moreMenu.addEventListener("click", function (e) {
      var act = e.target.dataset.act;
      if (!act) return;
      var p = FA.App.state.project;
      if (act === "regen") FA.App.regenerateAll();
      if (act === "export-txt") {
        FA.downloadText(FA.slugify(p.brief.productName) + "-flowaffiliate.txt",
          FA.buildExportPackage(p));
        FA.App.toast("File .txt diunduh", "ok");
      }
      if (act === "export-json") {
        FA.downloadText(FA.slugify(p.brief.productName) + "-flowaffiliate.json",
          FA.buildProjectJSON(p));
        FA.App.toast("File .json diunduh", "ok");
      }
      if (act === "save") {
        var ok = FA.Store.save(p);
        FA.App.toast(ok ? "Tersimpan di Library" : "Gagal menyimpan (storage penuh)", ok ? "ok" : "err");
      }
      if (act === "wizard") FA.App.resetWizard();
      moreMenu.classList.add("hidden");
    });

    // Tabs.
    document.querySelectorAll(".tab").forEach(function (t) {
      t.addEventListener("click", function () { FA.App.selectTab(t.dataset.tab); });
    });
  },

  selectTab: function (name) {
    document.querySelectorAll(".tab").forEach(function (t) {
      t.classList.toggle("is-active", t.dataset.tab === name);
    });
    ["prompts", "caption", "flow"].forEach(function (t) {
      document.getElementById("tab-" + t).classList.toggle("hidden", t !== name);
    });
  },

  bindTabs: function () { /* tabs dibinding di bindResultActions */ },

  /* Regenerate satu scene dengan variasi dialog baru. */
  regenScene: function (index) {
    var project = FA.App.state.project;
    if (!project || project.fromLibrary) {
      FA.App.toast("Project dari library tidak bisa di-regenerate", "err");
      return;
    }
    var scene = project.scenes.filter(function (s) { return s.index === index; })[0];
    if (!scene) return;

    var rng = FA.makeRng((project.seed + index * 7919 + Date.now()) >>> 0);
    var ctx = { rng: rng, vars: project.vars };
    var enriched = FA.enrichOffline(scene, ctx);
    scene.enriched = enriched;
    scene.dialogue = enriched.dialogue;
    scene.onscreen = enriched.onscreen;
    scene.prompt = FA.assemblePrompt(scene, enriched, project.continuity, project.brief);
    scene.validation = FA.validateScene(scene);
    scene.valid = scene.validation.every(function (c) { return c.pass; });

    FA.validateProject(project);
    FA.App.renderResults(project);
    FA.App.toast("Scene " + index + " ditulis ulang", "ok");
  },

  regenerateAll: function () {
    var b = FA.App.state.project.brief;
    FA.App.state.project = FA.generateProject(b, { seed: (Math.random() * 4294967295) >>> 0 });
    if (FA.AI.isEnabled()) {
      FA.AI.enrich(FA.App.state.project).then(function (enriched) {
        FA.App.renderResults(enriched || FA.App.state.project);
        FA.App.toast("Paket baru dibuat", "ok");
      });
    } else {
      FA.App.renderResults(FA.App.state.project);
      FA.App.toast("Paket baru dibuat", "ok");
    }
  },

  resetWizard: function () {
    FA.App.state.files = [];
    FA.App.state.project = null;
    FA.App.state.demoMode = false;
    document.getElementById("thumbs").innerHTML = "";
    document.getElementById("fName").value = "";
    ["fPain", "fAudience", "fPrice", "fPromo"].forEach(function (id) {
      document.getElementById(id).value = "";
    });
    document.getElementById("fCharRef").checked = false;
    FA.App.setStep(1);
    FA.App.showView("wizard");
    FA.App.refreshGenerateState();
  },

  openFromLibrary: function (id) {
    var slim = FA.Store.all().filter(function (p) { return p.id === id; })[0];
    if (!slim) return;
    var project = FA.Store.revive(slim);
    FA.App.state.project = project;
    FA.App.renderResults(project);
    FA.App.setStep(3);
    FA.App.showView("wizard");
    FA.App.toast("Project dibuka dari library", "ok");
  },

  /* -------------------------------------------------------- DEMO MODE */
  runDemo: function () {
    FA.App.state.demoMode = true;
    document.getElementById("fName").value = "Glow Serum Vitamin C";
    document.getElementById("fCategory").value = "SKINCARE";
    FA.App.onCategoryChange(true);
    document.getElementById("fPain").value = "kulit kusam dan berminyak di siang hari";
    document.getElementById("fAudience").value = "wanita 20-30 tahun, pekerja kantoran";
    document.getElementById("fPrice").value = "Rp 89.000";
    document.getElementById("fPromo").value = "diskon 40% hari ini";
    document.getElementById("fPlatform").value = "tiktok";
    FA.App.refreshGenerateState();
    FA.App.toast("Contoh dimuat — klik Buat 6 Prompt Scene", "ok");
    FA.App.setStep(1);
    FA.App.showView("wizard");
  },

  /* -------------------------------------------------------- SETTINGS */
  bindSettings: function () {
    document.getElementById("saveKeyBtn").addEventListener("click", function () {
      var v = document.getElementById("apiKey").value.trim();
      FA.AI.setKey(v);
      FA.App.setKeyStatus(v ? "API key disimpan. Narasi akan diperkaya AI." : "API key dihapus.", "ok");
      FA.App.toast(v ? "API key disimpan" : "API key dihapus", "ok");
    });

    document.getElementById("clearKeyBtn").addEventListener("click", function () {
      FA.AI.setKey("");
      document.getElementById("apiKey").value = "";
      FA.App.setKeyStatus("API key dihapus. Aplikasi berjalan offline.", "ok");
    });

    document.getElementById("testKeyBtn").addEventListener("click", function () {
      var key = document.getElementById("apiKey").value.trim() || FA.AI.getKey();
      if (!key) { FA.App.setKeyStatus("Masukkan API key dulu.", "err"); return; }
      FA.App.setKeyStatus("Menguji koneksi…", "");

      var url = FA.AI.ENDPOINT + FA.AI.MODEL + ":generateContent?key=" + encodeURIComponent(key);
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: "Balas satu kata: OK" }] }] }),
      })
        .then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          return r.json();
        })
        .then(function () {
          FA.App.setKeyStatus("✓ Koneksi berhasil. AI enrichment aktif.", "ok");
        })
        .catch(function (err) {
          FA.App.setKeyStatus("✗ Gagal: " + err.message + ". Cek key atau koneksi internet.", "err");
        });
    });
  },

  loadKeyIntoField: function () {
    var el = document.getElementById("apiKey");
    if (!el) return;
    var k = FA.AI.getKey();
    if (k) el.value = k;
    FA.App.setKeyStatus(
      k ? "AI enrichment aktif." : "Mode offline — prompt tetap dibuat lengkap tanpa API key.", "ok"
    );
  },

  setKeyStatus: function (msg, cls) {
    var el = document.getElementById("keyStatus");
    el.textContent = msg;
    el.className = "status " + (cls || "");
  },

  /* ------------------------------------------------------------ TOAST */
  toast: function (msg, kind) {
    var el = document.getElementById("toast");
    el.textContent = msg;
    el.className = "toast is-show" + (kind ? " is-" + kind : "");
    clearTimeout(FA.App._toastTimer);
    FA.App._toastTimer = setTimeout(function () {
      el.className = "toast";
    }, 2600);
  },

  /* ------------------------------------------------------------- COPY */
  copy: function (text, btn) {
    FA.copyText(text).then(function () {
      if (btn) {
        var original = btn.textContent;
        btn.textContent = "✓ Tersalin";
        btn.classList.add("btn-copied");
        setTimeout(function () {
          btn.textContent = original;
          btn.classList.remove("btn-copied");
        }, 1400);
      }
      FA.App.toast("Disalin ke clipboard", "ok");
    }).catch(function () {
      FA.App.toast("Gagal menyalin — salin manual dari kotak teks", "err");
    });
  },
};

document.addEventListener("DOMContentLoaded", FA.App.init);
