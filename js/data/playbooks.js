/* =========================================================================
 * FlowAffiliate — Playbooks
 *
 * Satu playbook = satu kategori produk, berisi:
 *   - continuity default (karakter, wardrobe, lokasi, lighting)
 *   - kandidat isian slot (pain, benefit, usage, waktu, audiens)
 *   - hashtag broad/niche/lokal
 *   - voice persona & visual style default
 *
 * Semua kandidat dipilih acak per generate sehingga output tidak monoton,
 * namun blok continuity SELALU identik di keenam scene (PRD §8.3).
 * ========================================================================= */

window.FA = window.FA || {};

FA.PLAYBOOKS = {

  /* ------------------------------------------------------------ SKINCARE */
  SKINCARE: {
    id: "SKINCARE",
    label: "Skincare & Perawatan Kulit",
    icon: "✨",
    matchKeywords: ["serum", "skincare", "krim", "cream", "toner", "sunscreen", "masker", "facial", "lotion", "kulit"],
    defaultVoice: "sahabat",
    defaultStyle: "aesthetic",
    defaultPacing: "standar",

    continuity: {
      talent: "the same Indonesian woman in her mid-20s, warm medium skin tone, straight black hair tied in a low bun, natural minimal makeup, no glasses",
      wardrobe: "a soft cream linen shirt and a thin gold necklace",
      location: "a clean modern bedroom with a large window and white sheer curtains",
      lighting: "soft diffused morning light from camera-left, gentle shadow falloff",
      grade: "bright airy grade, clean whites, soft neutral warmth",
    },

    pains: [
      "kulit kusam dan nggak cerah", "kulit berminyak di siang hari",
      "jerawat yang sering muncul", "bekas jerawat yang susah hilang",
      "kulit kering dan ketarik", "pori-pori besar dan tekstur kasar",
      "kulit kusam karena sering begadang",
    ],
    benefits: [
      "kulit jadi lebih cerah", "kulit terasa lebih kenyal",
      "minyak berlebih jadi terkontrol", "pori-pori tampak lebih halus",
      "kulit terasa lebih lembap seharian", "tone kulit jadi lebih rata",
    ],
    usages: [
      "teteskan 3 tetes lalu tepuk lembut ke seluruh wajah",
      "oles tipis merata pagi dan malam",
      "aplikasikan setelah mencuci wajah",
      "tepuk perlahan sampai meresap sempurna",
    ],
    times: ["pagi", "malam", "pagi dan malam", "setelah cuci muka"],
    audiences: ["anak kuliah", "pekerja kantoran", "ibu muda", "semua tipe kulit"],

    hashtags: {
      broad: ["#skincare", "#skincareroutine", "#beauty", "#racunskincare", "#glowingskin"],
      niche: ["#serumviral", "#reviewskincare", "#skincarelokal", "#kulitcerah", "#skincarepemula"],
      local: ["#racunshopee", "#reviewjujur", "#belanjashopee"],
    },
  },

  /* ------------------------------------------------------------- FASHION */
  FASHION: {
    id: "FASHION",
    label: "Fashion & Pakaian",
    icon: "👗",
    matchKeywords: ["baju", "kaos", "kemeja", "dress", "celana", "fashion", "tas", "sepatu", "sandal", "hijab", "outfit", "jaket"],
    defaultVoice: "genz",
    defaultStyle: "aesthetic",
    defaultPacing: "cepat",

    continuity: {
      talent: "the same Indonesian woman in her early 20s, slim build, medium skin tone, long wavy dark hair, natural glowing makeup",
      wardrobe: "a neutral beige top paired with light denim",
      location: "a bright minimalist studio with a large mirror and a clothing rack",
      lighting: "soft even studio lighting with a warm key from camera-right",
      grade: "clean modern grade, warm neutral, crisp fabric detail",
    },

    pains: [
      "baju yang nggak pernah pas di badan", "outfit yang kelihatan membosankan",
      "bahan yang panas dan bikin gerah", "susah cari baju yang muat",
      "warna cepat pudar setelah dicuci", "jahitan yang cepat rusak",
    ],
    benefits: [
      "bahan adem dan jatuh di badan", "bentuknya bikin tubuh terlihat lebih rapi",
      "warnanya tetap awet setelah dicuci", "mudah dipadupadankan",
      "harga terjangkau tapi kualitas oke", "jahitan rapi dan kuat",
    ],
    usages: [
      "dipakai untuk kerja maupun jalan santai",
      "dipadukan dengan sneakers putih atau heels",
      "dipakai langsung tanpa perlu banyak aksesori",
      "dicuci dengan mesin pun tetap aman",
    ],
    times: ["tiap hari", "kondangan", "kerja", "hangout"],
    audiences: ["mahasiswa", "anak kantor", "content creator", "ibu muda"],

    hashtags: {
      broad: ["#fashion", "#ootd", "#outfitinspo", "#fashionmuslim", "#stylehijab"],
      niche: ["#ootdindonesia", "#rekomendasibaju", "#fashionmurah", "#mixandmatch", "#lookviral"],
      local: ["#racunshopee", "#reviewjujur", "#shopeefinds"],
    },
  },

  /* ----------------------------------------------------------------- F&B */
  FNB: {
    id: "FNB",
    label: "Makanan & Minuman",
    icon: "🍜",
    matchKeywords: ["makanan", "minuman", "kopi", "snack", "cemilan", "keripik", "sambal", "mie", "kue", "coklat", "teh", "boba", "madU", "madu"],
    defaultVoice: "genz",
    defaultStyle: "homey",
    defaultPacing: "cepat",

    continuity: {
      talent: "the same Indonesian woman in her mid-20s, medium skin tone, dark hair in a loose ponytail",
      wardrobe: "a casual light grey t-shirt",
      location: "a cosy warm kitchen with wooden countertops and a window",
      lighting: "warm afternoon window light from camera-left, appetising specular highlights",
      grade: "rich warm food grade, saturated but natural colour, crisp texture detail",
    },

    pains: [
      "laper tengah malam tapi males keluar", "ngidam makanan yang susah dicari",
      "cemilan yang rasanya biasa aja", "sarapan yang selalu buru-buru",
      "cari makanan yang enak tapi murah", "sering bingung mau makan apa",
    ],
    benefits: [
      "rasanya nendang dan bikin nagih", "praktis tinggal seduh atau buka",
      "porsinya pas untuk satu orang", "harganya ramah di kantong",
      "bahannya terasa premium", "cocok untuk stok di rumah",
    ],
    usages: [
      "seduh dengan air panas lalu aduk rata",
      "buka kemasannya dan langsung nikmati",
      "tambahkan topping favoritmu sesuai selera",
      "simpan di kulkas untuk sensasi lebih segar",
    ],
    times: ["sarapan", "sore", "tengah malam", "kapan saja"],
    audiences: ["mahasiswa", "anak kos", "pekerja sibuk", "ibu rumah tangga"],

    hashtags: {
      broad: ["#kuliner", "#makanan", "#foodie", "#jajan", "#kulinerindonesia"],
      niche: ["#racunmakanan", "#rekomendasijajan", "#makananviral", "#snackviral", "#cemilanenak"],
      local: ["#racunshopee", "#reviewjujur", "#jajanshopee"],
    },
  },

  /* -------------------------------------------------------------- GADGET */
  GADGET: {
    id: "GADGET",
    label: "Gadget & Elektronik",
    icon: "📱",
    matchKeywords: ["gadget", "hp", "handphone", "laptop", "earbuds", "headset", "charger", "powerbank", "kamera", "mouse", "keyboard", "speaker", "smartwatch"],
    defaultVoice: "ahli",
    defaultStyle: "studio",
    defaultPacing: "standar",

    continuity: {
      talent: "the same Indonesian man in his late 20s, short neat black hair, light stubble, medium skin tone",
      wardrobe: "a plain dark navy t-shirt",
      location: "a modern minimal desk setup with a monitor arm and a plant",
      lighting: "clean softbox key light from the front-left, cool neutral fill, controlled reflections",
      grade: "clean cool-neutral tech grade, crisp edges, controlled highlights on glass and metal",
    },

    pains: [
      "baterai yang cepat habis", "perangkat yang cepat panas",
      "suara yang kurang jernih", "kabel yang sering rusak",
      "perangkat yang lambat dan bikin kesal", "harga mahal tapi fiturnya biasa",
    ],
    benefits: [
      "baterai tahan seharian", "koneksi stabil dan cepat",
      "suaranya jernih dan bass-nya terasa", "build quality terasa kokoh",
      "harganya jauh di bawah kompetitor", "langsung siap pakai tanpa ribet",
    ],
    usages: [
      "sambungkan lalu langsung pakai tanpa setup rumit",
      "isi daya penuh dulu lalu gunakan seharian",
      "pairing otomatis begitu dibuka",
      "colok dan langsung terdeteksi",
    ],
    times: ["kerja", "perjalanan", "olahraga", "main game"],
    audiences: ["anak kantor", "mahasiswa", "gamer", "pekerja mobile"],

    hashtags: {
      broad: ["#gadget", "#teknologi", "#reviewgadget", "#gadgetindonesia", "#elektronik"],
      niche: ["#reviewjujur", "#gadgetmurah", "#rekomendasigadget", "#unboxing", "#worthit"],
      local: ["#racunshopee", "#shopeefinds", "#tokopedia"],
    },
  },

  /* ---------------------------------------------------------------- HOME */
  HOME: {
    id: "HOME",
    label: "Perlengkapan Rumah",
    icon: "🏠",
    matchKeywords: ["rumah", "dapur", "perabot", "lampu", "rak", "kasur", "bantal", "sapu", "kompor", "panci", "wajan", "tissue", "home", "dekor"],
    defaultVoice: "ibubijak",
    defaultStyle: "homey",
    defaultPacing: "standar",

    continuity: {
      talent: "the same Indonesian woman in her mid-30s, warm medium skin tone, dark hair in a neat bun",
      wardrobe: "a soft sage-green blouse with the sleeves rolled up",
      location: "a tidy modern living room with light wood furniture and a woven rug",
      lighting: "warm late-afternoon light through a large window, soft ambient fill",
      grade: "cosy warm grade, natural wood tones, soft contrast",
    },

    pains: [
      "rumah yang selalu kelihatan berantakan", "peralatan yang cepat rusak",
      "pekerjaan rumah yang bikin capek", "barang yang makan tempat",
      "susah bersih-bersih di sudut sempit", "perabot yang nggak awet",
    ],
    benefits: [
      "rumah jadi jauh lebih rapi", "hemat waktu bersih-bersih",
      "bahannya kuat dan tahan lama", "hemat tempat dan mudah disimpan",
      "bikin ruangan terasa lebih nyaman", "harganya worth it banget",
    ],
    usages: [
      "pasang lalu langsung dipakai tanpa alat tambahan",
      "gunakan sesuai kebutuhan dan simpan kembali",
      "cukup dibersihkan dengan lap lembap",
      "taruh di tempat yang paling sering dipakai",
    ],
    times: ["pagi", "setelah memasak", "saat bersih-bersih", "tiap hari"],
    audiences: ["ibu rumah tangga", "anak kos", "pasangan muda", "pekerja sibuk"],

    hashtags: {
      broad: ["#rumah", "#home", "#perabotrumah", "#dekorasirumah", "#rumahminimalis"],
      niche: ["#racunrumah", "#homeorganizer", "#rekomendasirumah", "#dapur", "#rumahrapi"],
      local: ["#racunshopee", "#reviewjujur", "#belanjaonline"],
    },
  },

  /* -------------------------------------------------------------- HEALTH */
  HEALTH: {
    id: "HEALTH",
    label: "Kesehatan & Suplemen",
    icon: "💊",
    matchKeywords: ["vitamin", "suplemen", "kesehatan", "herbal", "jamu", "kapsul", "masker", "obat", "probiotik", "kolagen"],
    defaultVoice: "ahli",
    defaultStyle: "studio",
    defaultPacing: "standar",

    continuity: {
      talent: "the same Indonesian man in his early 30s, short black hair, clean shaven, medium skin tone, healthy appearance",
      wardrobe: "a crisp white polo shirt",
      location: "a bright clean kitchen counter with a glass of water and fresh fruit",
      lighting: "clean bright daylight from the front, soft even fill, no harsh shadows",
      grade: "clean natural health grade, bright and airy, fresh green accents",
    },

    pains: [
      "badan yang gampang lelah", "susah tidur dan sering begadang",
      "daya tahan tubuh yang menurun", "pencernaan yang kurang lancar",
      "nggak sempat sarapan sehat", "badan lemas di jam kerja",
    ],
    benefits: [
      "badan terasa lebih bertenaga", "tidur jadi lebih nyenyak",
      "pencernaan terasa lebih lancar", "nggak gampang lelah lagi",
      "praktis diminum di sela kesibukan", "bahan alami dan aman dikonsumsi",
    ],
    usages: [
      "minum satu kapsul setelah makan",
      "seduh dengan air hangat lalu diminum",
      "konsumsi rutin satu kali sehari",
      "minum di pagi hari sebelum beraktivitas",
    ],
    times: ["pagi", "setelah makan", "malam sebelum tidur", "tiap hari"],
    audiences: ["pekerja kantoran", "orang tua", "mahasiswa", "pekerja shift"],

    hashtags: {
      broad: ["#kesehatan", "#vitamin", "#hidupsehat", "#suplemen", "#kesehatan"],
      niche: ["#dayatahantubuh", "#suplemenherbal", "#reviewvitamin", "#tubuhsehat", "#hidupsehat"],
      local: ["#racunshopee", "#reviewjujur", "#kesehatanindonesia"],
    },
  },

  /* ----------------------------------------------------------- UNIVERSAL */
  UNIVERSAL: {
    id: "UNIVERSAL",
    label: "Umum (Semua Produk)",
    icon: "🎯",
    matchKeywords: [],
    defaultVoice: "sahabat",
    defaultStyle: "cinematic",
    defaultPacing: "standar",

    continuity: {
      talent: "the same Indonesian woman in her mid-20s, warm medium skin tone, dark hair tied back neatly, natural makeup",
      wardrobe: "a simple neutral cream top with minimal accessories",
      location: "a bright modern room with a large window and a neutral background",
      lighting: "soft natural window light from camera-left with gentle fill",
      grade: "clean warm neutral grade, soft contrast, subtle film texture",
    },

    pains: [
      "produk lama yang hasilnya mengecewakan", "cari produk yang benar-benar berkualitas",
      "harga mahal tapi hasilnya biasa", "bingung pilih yang mana di antara banyak pilihan",
      "produk yang cepat rusak", "beli online tapi takut zonk",
    ],
    benefits: [
      "kualitasnya jauh di atas harganya", "langsung terasa manfaatnya",
      "praktis dan mudah dipakai", "awet dan tahan lama",
      "banyak yang merekomendasikan", "nggak bikin nyesel setelah beli",
    ],
    usages: [
      "gunakan sesuai petunjuk pada kemasan",
      "cukup dipakai rutin untuk hasil terbaik",
      "langsung bisa dipakai setelah dibuka",
      "sesuaikan dengan kebutuhan harianmu",
    ],
    times: ["tiap hari", "pagi", "malam", "saat dibutuhkan"],
    audiences: ["semua kalangan", "anak muda", "pekerja", "ibu rumah tangga"],

    hashtags: {
      broad: ["#rekomendasi", "#produkviral", "#reviewproduk", "#belanjaonline", "#racunbelanja"],
      niche: ["#reviewjujur", "#produklokal", "#worthit", "#cobadulu", "#rekomendasiterbaik"],
      local: ["#racunshopee", "#shopeefinds", "#tokopedia"],
    },
  },
};

/* Urutan tampil di dropdown playbook */
FA.PLAYBOOK_ORDER = ["SKINCARE", "FASHION", "FNB", "GADGET", "HOME", "HEALTH", "UNIVERSAL"];

/* Pemilihan playbook otomatis dari teks kategori/nama produk (heuristik).
 * Ini pengganti call vision model saat mode offline. Lihat PRD §5.2 Langkah 2.
 *
 * Dua tingkat sinyal:
 *   - strongKeywords : istilah yang hampir pasti menandakan satu kategori
 *                      (mis. "serum" -> SKINCARE, "earbuds" -> GADGET).
 *                      Diberi bobot besar agar menang atas kata ambigu.
 *   - matchKeywords  : istilah umum, bobot kecil.
 *
 * Contoh masalah yang diselesaikan: "Serum Vitamin C" mengandung "vitamin"
 * (kata kunci HEALTH yang panjang) sekaligus "serum". Tanpa bobot, HEALTH
 * menang keliru. Dengan strongKeywords — dan dengan menahan "vitamin c" agar
 * tidak menjadi sinyal kuat — SKINCARE menang dengan benar.
 */
FA.STRONG_KEYWORDS = {
  SKINCARE: ["serum", "skincare", "toner", "sunscreen", "moisturizer", "facial wash",
             "micellar", "essence", "peeling", "acne patch", "lip balm", "body lotion"],
  FASHION:  ["kemeja", "dress", "celana", "hijab", "outfit", "tunik", "blazer",
             "cardigan", "rok", "sandal", "sneakers", "tas", "dompet", "jaket"],
  FNB:      ["kopi", "boba", "keripik", "sambal", "mie instan", "snack", "coklat",
             "cemilan", "nugget", "frozen food", "madu", "teh", "selai"],
  GADGET:   ["earbuds", "powerbank", "smartwatch", "charger", "headset", "tws",
             "keyboard", "mouse", "webcam", "ssd", "flashdisk", "speaker", "laptop"],
  HOME:     ["rak", "lampu", "kasur", "bantal", "panci", "wajan", "kompor", "sapu",
             "keset", "gorden", "toples", "perabot", "tempat sampah", "jemuran"],
  HEALTH:   ["suplemen", "kapsul", "probiotik", "kolagen", "herbal", "jamu",
             "multivitamin", "omega", "sirup herbal", "daya tahan tubuh", "imunitas",
             "vitamin otak", "susu pertumbuhan"],
  UNIVERSAL: [],
};

/* Catatan desain: "vitamin c" dan "vitamin d" SENGAJA tidak dijadikan sinyal
 * kuat untuk HEALTH. Dalam praktik affiliate Indonesia, "Serum Vitamin C"
 * jauh lebih sering produk skincare, sedangkan suplemen biasanya menyertakan
 * kata "suplemen", "kapsul", atau "multivitamin" yang sudah menjadi sinyal
 * kuat. Membiarkan "vitamin c" sebagai sinyal kuat membuat serum skincare
 * salah terdeteksi sebagai produk kesehatan. */

FA.detectPlaybook = function (text) {
  var t = String(text || "").toLowerCase();
  var best = null;
  var bestScore = 0;

  FA.PLAYBOOK_ORDER.forEach(function (id) {
    var pb = FA.PLAYBOOKS[id];
    var strong = FA.STRONG_KEYWORDS[id] || [];
    var score = 0;

    // Sinyal kuat — bobot besar (100) + panjang istilah sebagai tie-break.
    strong.forEach(function (kw) {
      if (t.indexOf(kw) !== -1) score += 100 + kw.length;
    });

    // Sinyal umum — bobot kecil (panjang istilah).
    (pb.matchKeywords || []).forEach(function (kw) {
      if (t.indexOf(kw) !== -1) score += kw.length;
    });

    if (score > bestScore) { bestScore = score; best = id; }
  });

  return best || "UNIVERSAL";
};
