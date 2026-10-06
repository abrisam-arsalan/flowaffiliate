/* =========================================================================
 * FlowAffiliate — Audience Profiles
 *
 * Profil audiens menjawab "bicara ke siapa", melengkapi PLAYBOOK (per
 * kategori produk) dan VOICES (per persona suara). Tiap profil menentukan:
 *   - nada bicara  -> disuntikkan ke arahan suara di blok [AUDIO]
 *   - pain         -> subset masalah yang relevan untuk audiens ini
 *   - hashtag      -> tag caption tambahan yang terasa komunitasnya
 *   - keywords     -> untuk menyimpulkan profil dari teks bebas
 *
 * PRINSIP: sapaan yang diketik pengguna SELALU menang ({{audience}} memakai
 * teksnya apa adanya). Profil hanya disimpulkan untuk gaya bahasa — sama
 * seperti aturan "isian pengguna menang" di tempat lain. Lihat PRD §5.2.
 * ========================================================================= */

window.FA = window.FA || {};

FA.AUDIENCES = {
  anak_muda: {
    id: "anak_muda",
    label: "Anak Muda / Mahasiswa",
    address: "anak muda",
    pronoun: "kamu",
    tone: "santai, jenaka, dan sadar budget",
    directive: "casual and playful with light slang, budget-conscious, quick punchy rhythm",
    pains: [
      "uang pas-pasan tapi pengen tampil keren",
      "tugas numpuk sampai nggak sempat urus diri",
      "pengen ikut tren tapi dompet menipis",
      "biaya hidup naik terus, jadi harus pilih-pilih",
    ],
    hashtags: ["#anakmuda", "#anakkos"],
    keywords: ["anak muda", "anak kos", "mahasiswa", "anak kuliah", "pelajar", "remaja", "gen z"],
  },

  pekerja: {
    id: "pekerja",
    label: "Pekerja / Anak Kantoran",
    address: "pekerja kantoran",
    pronoun: "kamu",
    tone: "cepat, efisien, dan anti ribet",
    directive: "brisk and efficient, to the point, respects limited time, no fluff",
    pains: [
      "waktu sempit antara kerja dan urusan pribadi",
      "capek di jalan sampai nggak sempat merawat diri",
      "penampilan harus rapi tiap hari tapi waktunya nggak ada",
      "target kerja numpuk sampai lupa diri sendiri",
    ],
    hashtags: ["#anakkantor", "#pekerjakantoran"],
    keywords: ["pekerja", "kantoran", "anak kantor", "pekerja sibuk", "pekerja shift",
      "pekerja mobile", "karyawan", "karier"],
  },

  ibu: {
    id: "ibu",
    label: "Ibu & Keluarga",
    address: "ibu muda",
    pronoun: "kamu",
    tone: "hangat, peduli keluarga, dan sabar",
    directive: "gentle, caring and reassuring, maternal warmth, family-first framing",
    pains: [
      "waktu habis untuk keluarga sampai lupa dirawat",
      "pengen yang praktis tapi tetap aman buat keluarga",
      "rumah berantakan padahal tamu mau datang",
      "budget belanja harus dijaga tiap bulan",
    ],
    hashtags: ["#ibumuda", "#keluargamuda"],
    keywords: ["ibu", "ibu muda", "ibu rumah tangga", "orang tua", "keluarga", "pasangan muda", "bunda"],
  },

  kreator: {
    id: "kreator",
    label: "Content Creator / Anak Sosmed",
    address: "content creator",
    pronoun: "kamu",
    tone: "asik, suka eksperimen, dan suka berbagi rekomendasi",
    directive: "enthusiastic and share-worthy, loves trying new things, speaks like a trend spotter",
    pains: [
      "konten harus konsisten padahal idenya seret",
      "pengen kelihatan kece di kamera tanpa effort banyak",
      "alat dan props ribet, pengen yang simpel aja",
      "takut ketinggalan tren yang lagi naik",
    ],
    hashtags: ["#contentcreator", "#kreatorlokal"],
    keywords: ["content creator", "kreator", "influencer", "anak sosmed", "selebgram", "youtuber", "tiktoker"],
  },

  gamer: {
    id: "gamer",
    label: "Gamer / Pecinta Gadget",
    address: "gamer dan pecinta gadget",
    pronoun: "kamu",
    tone: "to the point, suka spesifikasi, dan sedikit skeptis",
    directive: "technical and precise, spec-aware, mildly sceptical, values performance over hype",
    pains: [
      "perangkat lambat pas lagi fokus-fokusnya",
      "baterai habis di tengah sesi penting",
      "spesifikasi di iklan ternyata nggak sesuai aslinya",
      "cari gear yang awet tapi harganya masuk akal",
    ],
    hashtags: ["#gamer", "#techreview"],
    keywords: ["gamer", "gaming", "gadget", "teknologi", "tech", "geek", "spesifikasi"],
  },

  umum: {
    id: "umum",
    label: "Semua Kalangan",
    address: "",
    pronoun: "kamu",
    tone: "ramah dan mudah dipahami semua orang",
    directive: "warm and broadly accessible, clear and friendly",
    pains: [],
    hashtags: [],
    keywords: ["semua kalangan", "semua orang", "semua tipe", "umum"],
  },

  /* Fallback teks bebas: tidak ada nada khusus, sapaan pengguna dipakai
   * apa adanya (bisa juga tetap kena profil kalau kata kuncinya cocok). */
  custom: {
    id: "custom",
    label: "Custom (ketik sendiri)",
    address: "",
    pronoun: "kamu",
    tone: "",
    directive: "",
    pains: [],
    hashtags: [],
    keywords: [],
  },
};

FA.AUDIENCE_ORDER = ["anak_muda", "pekerja", "ibu", "kreator", "gamer", "umum"];

/* Simpulkan profil dari teks bebas (ketikan pengguna / saran AI).
 * Mengembalikan id profil, "custom" bila teks ada tapi tidak cocok,
 * atau "umum" bila teksnya kosong. */
FA.matchAudience = function (text) {
  var t = String(text || "").toLowerCase();
  if (!t.trim()) return "umum";

  var found = "";
  FA.AUDIENCE_ORDER.some(function (id) {
    var keys = FA.AUDIENCES[id].keywords || [];
    var hit = keys.some(function (k) { return t.indexOf(k) !== -1; });
    if (hit) found = id;
    return hit;
  });
  return found || "custom";
};
