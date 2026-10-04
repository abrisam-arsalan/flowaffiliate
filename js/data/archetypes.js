/* =========================================================================
 * FlowAffiliate — Scene Archetypes
 *
 * Enam arketipe naratif yang membentuk busur cerita affiliate:
 *   HOOK -> PROBLEM -> REVEAL -> DEMO -> PROOF -> CTA
 *
 * Setiap arketipe mendefinisikan blok teknis (shot, setting, camera, sfx)
 * dalam bahasa Inggris dan kandidat dialog/teks layar dalam Bahasa Indonesia.
 * Assembler memilih varian dialog yang MUAT dalam word budget durasi scene.
 * Lihat PRD §6.1, §6.4, §8.3.
 *
 * Placeholder yang tersedia:
 *   {{product}} {{category}} {{pain}} {{benefit}} {{usage}} {{time}}
 *   {{audience}} {{promo}} {{price}}
 * ========================================================================= */

window.FA = window.FA || {};

FA.ARCHETYPES = {

  /* ------------------------------------------------------------ 1. HOOK */
  HOOK: {
    id: "HOOK",
    label: "Hook",
    purpose: "Pattern interrupt & curiosity gap di 3 detik pertama",
    commands: ["/ADHOOK", "/UGCINTRO", "/CHARACTERLOCK", "/FACELOCK"],
    shot:
      "Medium close-up, single continuous shot, no jump cuts, no scene cuts.\n" +
      "The talent looks directly into the lens and speaks with a slightly\n" +
      "surprised, curious expression, holding {{product}} at eye level so the\n" +
      "label faces the camera.",
    setting: "{{location}}, {{lighting}}",
    camera:
      "Slow push-in from medium close-up to close-up across the full duration,\n" +
      "subtle handheld micro-movement, shallow depth of field, {{product}} label\n" +
      "stays in sharp focus.",
    sfx: "gentle whoosh accent in the final second as the product lifts",
    music: "soft uplifting lo-fi with a light build, no drums in the first two seconds",
    dialogueCandidates: [
      "Eh, aku baru nemu {{product}} dan hasilnya bikin aku kaget.",
      "Jangan skip dulu, ini yang akhirnya bikin masalah aku beres.",
      "Aku udah coba banyak produk, tapi baru ini yang beneran ngefek.",
      "Kalau kamu punya masalah yang sama, stop scroll sebentar.",
      "Aku nggak nyangka {{product}} semurah ini bisa sekeren ini.",
      "Ini rahasia yang bikin masalah aku hilang dalam seminggu.",
      "Tiga hari pakai {{product}}, dan aku langsung ngerti kenapa viral.",
      "Aku hampir nyerah, sampai nemu satu produk ini.",
      "Ternyata masalah aku cuma butuh satu produk ini.",
    ],
    onscreenCandidates: [
      "Kulit Kusam? Coba Ini",
      "Jangan Skip Dulu",
      "Ini Yang Bikin Beda",
      "Aku Baru Tahu",
      "Stop Scroll Sebentar",
      "Ternyata Ini Rahasianya",
    ],
  },

  /* --------------------------------------------------------- 2. PROBLEM */
  PROBLEM: {
    id: "PROBLEM",
    label: "Masalah",
    purpose: "Relatability — penonton merasa 'itu gue banget'",
    commands: ["/PROBLEMSOLUTION", "/TALKINGCAM", "/CHARACTERLOCK", "/FACELOCK", "/LOCATIONLOCK"],
    shot:
      "Medium shot, single continuous shot, no jump cuts.\n" +
      "The talent sits relaxed, gestures with one hand while speaking, and shakes\n" +
      "her head slightly in frustration at the memory, natural unposed body language.",
    setting: "{{location}}, {{lighting}}",
    camera:
      "Static tripod framing with a very slow drift to the right, eye-level angle,\n" +
      "shallow depth of field, soft background separation.",
    sfx: "soft room tone, a faint sigh at the start of the line",
    music: "mellow lo-fi, slightly downbeat to match the frustration",
    dialogueCandidates: [
      "Dulu aku tuh udah capek banget sama {{pain}} ini.",
      "Tiap hari ngadepin {{pain}}, sampai aku males bercermin.",
      "Kamu pernah nggak sih, udah usaha macem-macem tapi hasilnya tetap aja?",
      "Ini yang bikin aku frustrasi: {{pain}} nggak hilang-hilang.",
      "Aku udah keluar banyak uang, tapi nggak ada hasil yang bertahan.",
      "Semua orang ngasih saran, tapi masalah aku tetap sama.",
      "Aku sempat mikir, mungkin ini nggak bisa diatasin.",
      "Tiap pagi aku ngeluh soal hal yang sama terus.",
    ],
    onscreenCandidates: [
      "Relate Banget?",
      "Aku Juga Pernah",
      "Masalah Nomor Satu",
      "Siapa Lagi Yang Gini?",
      "Kamu Nggak Sendirian",
    ],
  },

  /* ---------------------------------------------------------- 3. REVEAL */
  REVEAL: {
    id: "REVEAL",
    label: "Product Reveal",
    purpose: "Dopamine hit — solusi muncul, tension dilepas",
    commands: ["/PRODUCTREVEAL", "/PRODUCTHERO", "/PRODUCTMACRO", "/PROPLOCK", "/LIGHTINGLOCK"],
    shot:
      "Macro close-up, single continuous shot, no jump cuts.\n" +
      "{{product}} sits on a clean surface; the talent's hand enters frame and\n" +
      "gently lifts it, turning it slowly so the label catches the light.",
    setting: "{{location}}, {{lighting}}, uncluttered hero surface",
    camera:
      "Slow arc orbit around {{product}} from left to centre, rack focus from the\n" +
      "hand to the product label, shallow depth of field, crisp product detail.",
    sfx: "delicate sparkle shimmer as the product turns into the light",
    music: "the lo-fi build resolves into a warm, hopeful chord",
    dialogueCandidates: [
      "Sampai akhirnya aku ketemu {{product}} ini.",
      "Dan ini dia yang akhirnya ngubah semuanya: {{product}}.",
      "Produknya simple banget, tapi hasilnya beda.",
      "Ini {{product}} yang semua orang di kolom komentar tanyain.",
      "Aku nemu {{product}} ini dan langsung jatuh cinta.",
      "Satu produk ini akhirnya nyelesaiin {{pain}} aku.",
      "Kenalin, {{product}} yang bikin aku berhenti cari yang lain.",
    ],
    onscreenCandidates: [
      "Ketemu Ini",
      "Solusinya Ternyata",
      "Produknya Simpel",
      "Ini Yang Viral Itu",
      "Akhirnya Ketemu",
    ],
  },

  /* ------------------------------------------------------------ 4. DEMO */
  DEMO: {
    id: "DEMO",
    label: "Cara Pakai & Manfaat",
    purpose: "Membuktikan fungsi produk dan menurunkan risiko pembelian",
    commands: ["/HOWTOUSE", "/BENEFITSAD", "/PRODUCTMACRO", "/CAMERALOCK"],
    shot:
      "Close-up, single continuous shot, no jump cuts.\n" +
      "The talent demonstrates how to use {{product}}: {{usage}}.\n" +
      "Hands stay in frame, movements are slow and deliberate.",
    setting: "{{location}}, {{lighting}}, clean surface with the product packaging nearby",
    camera:
      "Locked-off close-up on the hands and product with a slow 15-degree tilt,\n" +
      "sharp focus on the point of contact, shallow depth of field.",
    sfx: "subtle tactile sound of the product being opened or applied",
    music: "steady warm lo-fi, gentle forward momentum",
    dialogueCandidates: [
      "Cara pakainya gampang, cukup {{usage}}.",
      "Aku pakai tiap {{time}}, dan langsung kerasa bedanya.",
      "Teksturnya ringan, cepat meresap, dan hasilnya {{benefit}}.",
      "Cukup {{usage}}, tiap {{time}}, hasilnya konsisten.",
      "Yang aku suka, {{usage}} itu nggak bikin ribet.",
      "Baru beberapa hari pakai, {{benefit}} udah kelihatan.",
      "Ini yang bikin aku bertahan: hasilnya beneran {{benefit}}.",
    ],
    onscreenCandidates: [
      "Cara Pakainya",
      "Gampang Banget",
      "Hasilnya Nyata",
      "Cukup 3 Langkah",
      "Anti Ribet",
    ],
  },

  /* ------------------------------------------------------------ 5. PROOF */
  PROOF: {
    id: "PROOF",
    label: "Bukti Sosial",
    purpose: "Social proof — menghilangkan keraguan terakhir",
    commands: ["/TESTIMONIALUGC", "/RESULTSHOT", "/BEFOREAFTER", "/WARDROBELOCK"],
    shot:
      "Medium close-up, single continuous shot, no jump cuts.\n" +
      "The talent holds {{product}}, smiles with quiet confidence, nods slightly\n" +
      "while speaking, then lifts the product closer to the lens.",
    setting: "{{location}}, {{lighting}}, same wardrobe and position as the hook scene",
    camera:
      "Gentle handheld push-in, eye-level, natural movement, product held in the\n" +
      "lower third of the frame to keep the face clearly visible.",
    sfx: "soft affirmative room tone, faint notification chime accent",
    music: "confident warm lo-fi, fuller arrangement than earlier scenes",
    dialogueCandidates: [
      "Udah sebulan aku pakai, dan hasilnya beneran kerasa.",
      "Teman aku juga nyoba, dan hasilnya sama.",
      "Ribuan review positif, dan sekarang aku ngerti kenapa.",
      "Aku udah repeat order tiga kali, itu buktinya.",
      "Bukan cuma aku, {{audience}} juga ngerasain hal yang sama.",
      "Awalnya aku ragu, tapi sekarang aku yang nyaranin ke orang lain.",
      "Ini bukan sekali pakai langsung ajaib, tapi konsisten hasilnya.",
    ],
    onscreenCandidates: [
      "Bukti Nyata",
      "Review Jujur",
      "Sebulan Pakai",
      "Repeat Order",
      "Bukan Kaleng-Kaleng",
    ],
  },

  /* -------------------------------------------------------------- 6. CTA */
  CTA: {
    id: "CTA",
    label: "Ajakan Bertindak",
    purpose: "Urgensi + ajakan jelas, menutup dengan brand recall",
    commands: ["/UGCCTA", "/CTAEND", "/ENDINGBRAND", "/VOICELOCK"],
    shot:
      "Medium shot, single continuous shot, no jump cuts.\n" +
      "The talent faces the lens, holds {{product}} beside the face, smiles warmly\n" +
      "and gestures toward the lower part of the frame where the button sits.",
    setting: "{{location}}, {{lighting}}, slightly tighter framing than previous scenes",
    camera:
      "Slow steady push-in to medium close-up, locked horizon, product and face\n" +
      "both in frame, clean and stable final frame.",
    sfx: "bright confirm chime on the final beat",
    music: "uplifting resolve with a clear, warm ending",
    dialogueCandidates: [
      "Kalau kamu ngerasain hal yang sama, cobain deh.",
      "Langsung cek keranjang kuning sebelum promonya habis.",
      "Klik link di bio, masih ada diskon hari ini.",
      "Stoknya sering habis, jadi jangan sampai kehabisan.",
      "Cobain dulu, nanti kamu ngerti sendiri bedanya.",
      "Ambil sekarang selagi {{promo}} masih jalan.",
    ],
    onscreenCandidates: [
      "Keranjang Kuning",
      "Diskon Hari Ini",
      "Link di Bio",
      "Stok Terbatas",
      "Cek Sekarang",
    ],
  },
};

FA.ARCHETYPE_ORDER = ["HOOK", "PROBLEM", "REVEAL", "DEMO", "PROOF", "CTA"];
