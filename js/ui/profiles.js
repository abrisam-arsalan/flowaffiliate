/* =========================================================================
 * FlowAffiliate — UI Profil API
 *
 * Mengelola beberapa konfigurasi API: tambah, ubah, aktifkan, hapus, dan uji.
 * API key TIDAK PERNAH masuk ke modul ini — server hanya mengirim versi
 * tersamarkan (`apiKeyMasked`), dan saat menyimpan kita hanya mengirim key
 * bila pengguna mengetik yang baru.
 * ========================================================================= */

window.FA = window.FA || {};

FA.Profiles = {
  /** Daftar terakhir dari server; dipakai untuk mode edit & konfirmasi hapus. */
  cache: [],
  activeId: null,
  editingId: null,

  init: function () {
    var newBtn = document.getElementById("newProfileBtn");
    if (newBtn) newBtn.addEventListener("click", function () { FA.Profiles.openForm(null); });

    var cancel = document.getElementById("cancelProfileBtn");
    if (cancel) cancel.addEventListener("click", function () { FA.Profiles.closeForm(); });

    var saveBtn = document.getElementById("saveProfileBtn");
    if (saveBtn) saveBtn.addEventListener("click", function () { FA.Profiles.save(); });

    var testBtn = document.getElementById("testProfileBtn");
    if (testBtn) testBtn.addEventListener("click", function () { FA.Profiles.testDraft(false); });

    var testImg = document.getElementById("testImageBtn");
    if (testImg) testImg.addEventListener("click", function () { FA.Profiles.testDraft(true); });

    // Aksi pada kartu profil (delegasi event).
    var list = document.getElementById("profileList");
    if (list) {
      list.addEventListener("click", function (e) {
        var act = e.target.closest("[data-pact]");
        if (!act) return;
        var id = act.dataset.pid;
        var what = act.dataset.pact;
        if (what === "activate") FA.Profiles.activate(id);
        if (what === "edit") FA.Profiles.openForm(id);
        if (what === "delete") FA.Profiles.remove(id);
        if (what === "test") FA.Profiles.testSaved(id);
      });
    }

    FA.Profiles.load();
  },

  /* ------------------------------------------------------------- Muat */

  load: function () {
    var list = document.getElementById("profileList");
    if (!list) return;

    list.innerHTML = '<p class="muted">Memuat profil…</p>';

    fetch("/api/profiles", { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        FA.Profiles.cache = d.profiles || [];
        FA.Profiles.activeId = d.activeId || null;
        FA.Profiles.fillSuggestions(d.suggestedModels || []);
        FA.Profiles.render(d);
      })
      .catch(function () {
        list.innerHTML =
          '<p class="muted">Tidak bisa memuat profil. Pastikan server lokal berjalan.</p>';
      });
  },

  fillSuggestions: function (models) {
    var dl = document.getElementById("visionSuggestions");
    if (!dl || !models.length) return;
    dl.innerHTML = models.map(function (m) {
      return '<option value="' + FA.esc(m) + '"></option>';
    }).join("");
  },

  /* ----------------------------------------------------------- Render */

  render: function (d) {
    var list = document.getElementById("profileList");
    if (!list) return;

    if (!FA.Profiles.cache.length) {
      var src = d && d.effective ? d.effective.source : "none";
      list.innerHTML =
        '<div class="empty" style="padding:1.5rem 1rem">' +
        '<div class="empty-icon">🔑</div>' +
        "<p>Belum ada profil API.</p>" +
        "<p class='hint'>" +
        (src === "env"
          ? "Saat ini memakai nilai dari <code>.env</code>. Menambah profil akan menimpanya."
          : "Tanpa profil, analisis AI mati dan aplikasi memakai heuristik kata kunci.") +
        "</p></div>";
      return;
    }

    list.innerHTML = FA.Profiles.cache.map(function (p) {
      var isActive = p.id === FA.Profiles.activeId;

      var testBadge = "";
      if (p.lastTestOk === true) testBadge = '<span class="pill ok">teruji</span>';
      else if (p.lastTestOk === false) testBadge = '<span class="pill warn">gagal diuji</span>';

      return '<div class="profile-card' + (isActive ? " is-active" : "") + '">' +
        '<div class="profile-head">' +
          '<div>' +
            '<div class="profile-name">' + FA.esc(p.name) +
              (isActive ? ' <span class="pill ok">AKTIF</span>' : "") +
              " " + testBadge +
            "</div>" +
            '<div class="profile-meta">' +
              FA.esc(p.baseUrl) + " · <code>" + FA.esc(p.visionModel) + "</code>" +
              " · key <code>" + FA.esc(p.apiKeyMasked || "—") + "</code>" +
            "</div>" +
          "</div>" +
        "</div>" +
        (p.lastTestMsg
          ? '<div class="profile-test-msg">' + FA.esc(p.lastTestMsg) + "</div>"
          : "") +
        '<div class="btn-row">' +
          (isActive
            ? '<button class="btn btn-ghost btn-sm" disabled>Sedang aktif</button>'
            : '<button class="btn btn-primary btn-sm" data-pact="activate" data-pid="' +
              FA.esc(p.id) + '">Aktifkan</button>') +
          '<button class="btn btn-secondary btn-sm" data-pact="test" data-pid="' +
            FA.esc(p.id) + '">Tes</button>' +
          '<button class="btn btn-ghost btn-sm" data-pact="edit" data-pid="' +
            FA.esc(p.id) + '">Ubah</button>' +
          '<button class="btn btn-ghost btn-sm" data-pact="delete" data-pid="' +
            FA.esc(p.id) + '">Hapus</button>' +
        "</div>" +
      "</div>";
    }).join("");
  },

  /* ------------------------------------------------------------- Form */

  openForm: function (id) {
    var card = document.getElementById("profileFormCard");
    if (!card) return;

    FA.Profiles.editingId = id;
    var p = id
      ? FA.Profiles.cache.filter(function (x) { return x.id === id; })[0]
      : null;

    document.getElementById("profileFormTitle").textContent =
      p ? "Ubah profil: " + p.name : "Tambah profil API";

    document.getElementById("pName").value = p ? p.name : "";
    document.getElementById("pBaseUrl").value = p ? p.baseUrl : "";
    document.getElementById("pApiKey").value = "";
    document.getElementById("pVisionModel").value = p ? p.visionModel : "glm-5.3-flash";
    document.getElementById("pTextModel").value = p ? p.textModel : "gpt-5.6-luna";
    document.getElementById("pModels").value =
      p && p.visionModels ? p.visionModels.join(", ") : "";
    document.getElementById("pTimeout").value = p ? Math.round(p.timeoutMs / 1000) : 60;

    // Saat mengubah, key boleh dikosongkan untuk mempertahankan yang lama.
    document.getElementById("pKeyReq").style.display = p ? "none" : "";
    document.getElementById("pApiKey").placeholder = p
      ? "biarkan kosong untuk mempertahankan key lama (" + (p.apiKeyMasked || "—") + ")"
      : "sk-...";

    FA.Profiles.setFormStatus("", "");

    // Mode uji hanya memengaruhi /api/vision dan /api/enrich. Tombol "Tes"
    // di form ini SELALU menghubungi gateway sungguhan, jadi tidak perlu
    // dinonaktifkan — tapi pengguna sebaiknya tahu bedanya.
    var isMockMode = FA.Profiles._mock === true;
    if (isMockMode) {
      FA.Profiles.setFormStatus(
        "Mode uji (AI_MOCK=1) aktif. Analisis gambar memakai contoh tanpa jaringan, " +
        "tetapi tombol Tes di bawah tetap menghubungi gateway sungguhan — " +
        "jadi kamu bisa memastikan Base URL dan key benar.",
        "",
      );
    }

    card.classList.remove("hidden");
    card.scrollIntoView({ behavior: "smooth", block: "nearest" });
  },

  closeForm: function () {
    var card = document.getElementById("profileFormCard");
    if (card) card.classList.add("hidden");
    FA.Profiles.editingId = null;
  },

  setFormStatus: function (msg, cls) {
    var el = document.getElementById("profileFormStatus");
    if (!el) return;
    el.textContent = msg;
    el.className = "status " + (cls || "");
  },

  /** Baca isi form menjadi objek profil. */
  readForm: function () {
    var modelsRaw = document.getElementById("pModels").value.trim();
    var visionModels = modelsRaw
      ? modelsRaw.split(",").map(function (s) { return s.trim(); }).filter(Boolean)
      : [];

    var secs = Number(document.getElementById("pTimeout").value);
    if (!isFinite(secs) || secs < 3) secs = 60;

    return {
      id: FA.Profiles.editingId || undefined,
      name: document.getElementById("pName").value.trim(),
      baseUrl: document.getElementById("pBaseUrl").value.trim(),
      apiKey: document.getElementById("pApiKey").value.trim(),
      visionModel: document.getElementById("pVisionModel").value.trim(),
      textModel: document.getElementById("pTextModel").value.trim(),
      visionModels: visionModels,
      timeoutMs: Math.round(secs * 1000),
    };
  },

  /* ------------------------------------------------------------ Aksi */

  save: function () {
    var data = FA.Profiles.readForm();

    if (!data.name) { FA.Profiles.setFormStatus("Nama profil wajib diisi.", "err"); return; }
    if (!data.baseUrl) { FA.Profiles.setFormStatus("Base URL wajib diisi.", "err"); return; }
    if (!FA.Profiles.editingId && !data.apiKey) {
      FA.Profiles.setFormStatus("API key wajib diisi untuk profil baru.", "err");
      return;
    }

    FA.Profiles.setFormStatus("Menyimpan…", "");

    fetch("/api/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d.ok) {
          FA.Profiles.setFormStatus(d.error || "Gagal menyimpan.", "err");
          return;
        }
        FA.Profiles.closeForm();
        FA.App.toast("Profil disimpan dan siap dipakai", "ok");
        FA.Profiles.load();
        // Status AI di atas ikut diperbarui agar tidak menampilkan data lama.
        if (FA.App.loadAiStatus) FA.App.loadAiStatus();
      })
      .catch(function (e) {
        FA.Profiles.setFormStatus("Gagal menyimpan: " + e.message, "err");
      });
  },

  activate: function (id) {
    fetch("/api/profiles/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: id }),
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d.ok) { FA.App.toast(d.error || "Gagal mengaktifkan", "err"); return; }
        FA.App.toast("Profil diaktifkan — langsung berlaku tanpa restart", "ok");
        FA.Profiles.load();
        if (FA.App.loadAiStatus) FA.App.loadAiStatus();
      })
      .catch(function (e) { FA.App.toast("Gagal: " + e.message, "err"); });
  },

  remove: function (id) {
    var p = FA.Profiles.cache.filter(function (x) { return x.id === id; })[0];
    var name = p ? p.name : "profil ini";
    if (!confirm('Hapus profil "' + name + '"? API key-nya ikut terhapus.')) return;

    fetch("/api/profiles?id=" + encodeURIComponent(id), { method: "DELETE" })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d.ok) { FA.App.toast(d.error || "Gagal menghapus", "err"); return; }
        FA.App.toast("Profil dihapus", "ok");
        FA.Profiles.load();
        if (FA.App.loadAiStatus) FA.App.loadAiStatus();
      })
      .catch(function (e) { FA.App.toast("Gagal: " + e.message, "err"); });
  },

  /** Uji profil yang sudah tersimpan. */
  testSaved: function (id) {
    FA.App.toast("Menguji koneksi…", "");
    fetch("/api/profiles/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: id }),
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        FA.App.toast(d.ok ? "✓ " + d.message : "✗ " + (d.error || "gagal"), d.ok ? "ok" : "err");
        FA.Profiles.load();
      })
      .catch(function (e) { FA.App.toast("Gagal: " + e.message, "err"); });
  },

  /**
   * Uji isi form TANPA menyimpan, supaya bisa dipastikan benar sebelum disimpan.
   * Untuk profil yang sedang diubah dan kolom key dibiarkan kosong, key lama
   * tidak bisa dibaca browser — maka uji diarahkan ke profil tersimpan.
   */
  testDraft: function (withImage) {
    var data = FA.Profiles.readForm();

    if (FA.Profiles.editingId && !data.apiKey) {
      FA.Profiles.setFormStatus(
        "Menguji memakai key yang tersimpan" + (withImage ? " (termasuk baca gambar)" : "") + "…",
        "",
      );
      fetch("/api/profiles/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: FA.Profiles.editingId, withImage: withImage }),
      })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          FA.Profiles.setFormStatus(d.ok ? "✓ " + d.message : "✗ " + (d.error || "gagal"), d.ok ? "ok" : "err");
          FA.Profiles.load();
        })
        .catch(function (e) { FA.Profiles.setFormStatus("✗ " + e.message, "err"); });
      return;
    }

    if (!data.baseUrl || !data.apiKey) {
      FA.Profiles.setFormStatus("Isi Base URL dan API key dulu untuk menguji.", "err");
      return;
    }

    FA.Profiles.setFormStatus(
      withImage ? "Menguji dan mengirim gambar contoh…" : "Menguji koneksi…",
      "",
    );

    fetch("/api/profiles/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        baseUrl: data.baseUrl,
        apiKey: data.apiKey,
        visionModel: data.visionModel,
        withImage: withImage,
      }),
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        FA.Profiles.setFormStatus(d.ok ? "✓ " + d.message : "✗ " + (d.error || "gagal"), d.ok ? "ok" : "err");
      })
      .catch(function (e) { FA.Profiles.setFormStatus("✗ " + e.message, "err"); });
  },
};
