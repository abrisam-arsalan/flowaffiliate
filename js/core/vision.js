/* =========================================================================
 * FlowAffiliate — Vision Client
 *
 * Menganalisis foto produk memakai model AI lewat proxy di server lokal
 * (/api/vision). Hasilnya dipakai Conductor Engine untuk menghasilkan prompt
 * yang jauh lebih spesifik.
 *
 * PRINSIP: AI adalah PENYEMPURNA, bukan syarat. Setiap kegagalan (tanpa
 * server, tanpa API key, gateway mati, model tidak bisa baca gambar) harus
 * membuat aplikasi kembali ke heuristik keyword — bukan menggagalkan generate.
 * ========================================================================= */

window.FA = window.FA || {};

FA.Vision = {
  /** Sisi terpanjang gambar setelah dikecilkan. Foto ponsel 4000px tidak perlu
   *  dikirim apa adanya: boros token, lambat, dan biasanya ditolak gateway. */
  MAX_EDGE: 1024,
  JPEG_QUALITY: 0.85,

  /** Apakah proxy AI mungkin tersedia? Kalau halaman dibuka lewat file://,
   *  tidak ada server sama sekali, jadi jangan buang waktu mencoba. */
  available: function () {
    return location.protocol === "http:" || location.protocol === "https:";
  },

  /** Petakan respons mentah /api/status menjadi bentuk yang dipakai UI.
   *  Dipisah sebagai fungsi murni supaya bisa diuji tanpa jaringan —
   *  sekaligus tempat yang tepat untuk bug "models tidak diteruskan". */
  mapStatus: function (d) {
    var v = (d && d.vision) || {};
    return {
      ok: true,
      configured: !!v.configured,
      mock: !!v.mock,
      model: v.model || "",
      // Tanpa diteruskan di sini, pemilih model di UI selalu jatuh ke
      // satu opsi saja meski server mengirim daftar lengkap.
      models: Array.isArray(v.models) ? v.models.slice() : (v.model ? [v.model] : []),
      baseUrlHost: v.baseUrlHost || "",
      reason: v.reason || null,
      textModel: (d && d.text && d.text.model) || "",
    };
  },

  /** Status konfigurasi server (model apa, mock atau tidak). */
  status: function () {
    if (!FA.Vision.available()) {
      return Promise.resolve({
        ok: false,
        offline: true,
        reason: "Halaman dibuka lewat file://, jadi proxy AI tidak tersedia. " +
                "Jalankan `bun run server.ts` lalu buka http://localhost:3000.",
      });
    }
    return fetch("/api/status", { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (d) { return FA.Vision.mapStatus(d); })
      .catch(function () {
        return { ok: false, offline: true, reason: "Tidak bisa menghubungi server lokal." };
      });
  },

  /** Kecilkan gambar dan ubah jadi data URL JPEG.
   *  Dipakai FileReader -> data URL (bukan object URL) supaya canvas tidak
   *  ter-taint dan getImageData/toDataURL tetap aman. */
  prepare: function (file) {
    return new Promise(function (resolve, reject) {
      if (!/^image\//.test(file.type)) {
        reject(new Error("Bukan berkas gambar: " + file.name));
        return;
      }

      var reader = new FileReader();
      reader.onerror = function () { reject(new Error("Gagal membaca " + file.name)); };
      reader.onload = function () {
        var img = new Image();
        img.onerror = function () { reject(new Error("Gambar tidak bisa dibaca: " + file.name)); };
        img.onload = function () {
          try {
            var scale = Math.min(1, FA.Vision.MAX_EDGE / Math.max(img.width, img.height));
            var w = Math.max(1, Math.round(img.width * scale));
            var h = Math.max(1, Math.round(img.height * scale));

            var canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            var ctx = canvas.getContext("2d");

            // Latar putih: JPEG tidak mengenal transparansi, dan PNG produk
            // transparan akan jadi hitam tanpa ini.
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, w, h);
            ctx.drawImage(img, 0, 0, w, h);

            resolve({
              dataUrl: canvas.toDataURL("image/jpeg", FA.Vision.JPEG_QUALITY),
              width: w,
              height: h,
              originalWidth: img.width,
              originalHeight: img.height,
              name: file.name,
            });
          } catch (e) {
            reject(new Error("Gagal memproses " + file.name + ": " + e.message));
          }
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  },

  /** Model yang dipilih pengguna. Disimpan di browser karena ini sekadar
   *  preferensi kualitas-vs-biaya, bukan rahasia. Server tetap memvalidasi
   *  pilihan ini terhadap allowlist AI_VISION_MODELS. */
  selectedModel: function () {
    try { return localStorage.getItem("fa_vision_model") || ""; }
    catch (e) { return ""; }
  },

  setSelectedModel: function (name) {
    try {
      if (name) localStorage.setItem("fa_vision_model", name);
      else localStorage.removeItem("fa_vision_model");
    } catch (e) { /* localStorage bisa diblokir */ }
  },

  /** Analisis beberapa gambar sekaligus. Selalu resolve — tidak pernah reject —
   *  supaya pemanggil bisa memperlakukan hasil null sebagai "pakai heuristik". */
  analyze: function (files, hint) {
    if (!files || !files.length) return Promise.resolve(null);

    if (!FA.Vision.available()) return Promise.resolve(null);

    var limit = Math.min(files.length, 3); // 3 gambar sudah lebih dari cukup
    var jobs = [];
    for (var i = 0; i < limit; i++) jobs.push(FA.Vision.prepare(files[i]));

    return Promise.all(jobs)
      .then(function (prepared) {
        return fetch("/api/vision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            images: prepared.map(function (p) { return p.dataUrl; }),
            hint: hint || "",
            model: FA.Vision.selectedModel(),
          }),
        });
      })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) throw new Error(data && data.error ? data.error : "HTTP " + res.status);
          return data;
        });
      })
      .then(function (data) {
        var norm = FA.Vision.normalize(data.analysis);
        norm.usage = data.usage || null;
        norm.model = data.model || null;
        norm.source = data.model === "mock" ? "mock" : "ai";
        norm.previews = null;
        return norm;
      })
      .catch(function (err) {
        // Jangan pernah menggagalkan generate karena AI bermasalah.
        console.warn("[FlowAffiliate] analisis gambar dilewati:", err.message);
        return { failed: true, error: err.message, source: "none" };
      });
  },

  /** Rapikan keluaran model: paksa tipe yang benar dan buang yang kosong.
   *  Model sering mengembalikan angka sebagai string atau field hilang. */
  normalize: function (raw) {
    raw = raw || {};

    function str(v, max) {
      if (v === null || v === undefined) return "";
      var s = String(v).trim();
      return max ? s.slice(0, max) : s;
    }
    function list(v, maxItems, maxLen, minLen) {
      if (!Array.isArray(v)) return [];
      var lo = minLen || 1;
      return v
        .map(function (x) { return str(x, maxLen); })
        // Filter DULU, baru potong. Kalau dibalik, entri sampah ikut memakan
        // kuota slot sehingga jumlah hasil berguna jadi lebih sedikit.
        .filter(function (x) { return x.length >= lo; })
        .slice(0, maxItems);
    }

    var cat = str(raw.category).toUpperCase();
    if (FA.PLAYBOOKS && !FA.PLAYBOOKS[cat]) cat = "";

    var conf = Number(raw.confidence);
    if (!isFinite(conf)) conf = 0;
    conf = Math.max(0, Math.min(1, conf));

    return {
      productName: str(raw.productName, 80),
      category: cat,
      confidence: conf,
      productDescription: str(raw.productDescription, 400),
      labelText: str(raw.labelText, 120),
      packaging: {
        type: str(raw.packaging && raw.packaging.type, 60),
        color: str(raw.packaging && raw.packaging.color, 60),
        material: str(raw.packaging && raw.packaging.material, 60),
        finish: str(raw.packaging && raw.packaging.finish, 60),
      },
      // Warna: validasi format DULU, baru batasi jumlahnya. Kalau dibatasi
      // lebih dulu, entri tidak valid tetap memakan kuota slot.
      dominantColors: (function () {
        if (!Array.isArray(raw.dominantColors)) return [];
        return raw.dominantColors
          .map(function (c) { return str(c, 9); })
          .filter(function (c) { return /^#[0-9a-f]{3,8}$/i.test(c); })
          .slice(0, 5);
      })(),
      visualMood: str(raw.visualMood, 120),
      suggestedSetting: str(raw.suggestedSetting, 160),
      suggestedLighting: str(raw.suggestedLighting, 160),
      suggestedWardrobe: str(raw.suggestedWardrobe, 160),
      // Minimal 2 huruf: sisa potongan seperti "a" tidak berguna sebagai narasi.
      suggestedPains: list(raw.suggestedPains, 4, 90, 2),
      suggestedBenefits: list(raw.suggestedBenefits, 4, 90, 2),
      suggestedAudience: str(raw.suggestedAudience, 120),
      usageHint: str(raw.usageHint, 160),
    };
  },
};
