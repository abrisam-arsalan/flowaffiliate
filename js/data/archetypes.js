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
 *   {{audience}} {{promo}} {{price}} {{pronoun}}
 *
 * Field `anchorMode` menentukan cara foto produk dipakai saat mode anchor aktif:
 *   "frame"      -> produk adalah SUBJEK utama; foto cocok jadi frame awal
 *                   (Frames-to-Video) supaya produk terkunci di level piksel.
 *   "ingredient" -> talent adalah subjeknya; foto jadi ingredient/prop terkunci
 *                   (Ingredients-to-Video), setara FaceLock untuk karakter.
 *
 * Anti-monoton: treatment visual tiap arketipe berupa BANK varian
 * (shots/settings/cameras/sfxs/musics) yang diacak per generate, plus
 * `arcVariants` untuk mengubah isi slot scene. Hook angle ada di bagian
 * bawah berkas ini. Lihat FA.HOOK_ANGLES.
 * ========================================================================= */

window.FA = window.FA || {};

FA.ARCHETYPES = {

  /* ------------------------------------------------------------ 1. HOOK */
  HOOK: {
    id: "HOOK",
    label: "Hook",
    purpose: "Pattern interrupt & curiosity gap di 3 detik pertama",
    commands: ["/ADHOOK", "/UGCINTRO", "/CHARACTERLOCK", "/FACELOCK"],
    shots: [
      "Medium close-up, single continuous shot, no jump cuts, no scene cuts.\n" +
      "The talent looks directly into the lens and speaks with a slightly\n" +
      "surprised, curious expression, holding {{product}} at eye level so the\n" +
      "label faces the camera.",
      "Tight close-up, single continuous shot, no jump cuts.\n" +
      "The talent leans into the lens with a knowing half-smile, then lifts\n" +
      "{{product}} into frame from below so it sits beside the cheek, label forward.",
      "Medium shot from the chest up, single continuous shot, no jump cuts.\n" +
      "The talent takes one step toward the camera while talking, {{product}} held\n" +
      "loosely in one hand, eyes locked on the lens.",
    ],
    settings: [
      "{{location}}, {{lighting}}",
      "{{location}} beside a window, {{lighting}}",
      "A lived-in corner of {{location}}, {{lighting}}",
    ],
    cameras: [
      "Slow push-in from medium close-up to close-up across the full duration,\n" +
      "subtle handheld micro-movement, shallow depth of field, {{product}} label\n" +
      "stays in sharp focus.",
      "Handheld eye-level framing with natural micro-shake; a quick rack focus\n" +
      "lands on the {{product}} label halfway through, shallow depth of field.",
      "Locked-off frame at eye level with a subtle parallax as the talent leans in,\n" +
      "shallow depth of field, product and face both sharp.",
    ],
    sfxs: [
      "gentle whoosh accent in the final second as the product lifts",
      "a quick rising whoosh as {{product}} enters frame",
      "soft fabric rustle as the product lifts into frame",
    ],
    musics: [
      "soft uplifting lo-fi with a light build, no drums in the first two seconds",
      "bright minimal pluck melody, curious and open-ended",
      "warm acoustic guitar loop that ends on a light riser",
    ],
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
      "Eh {{audience}}, jangan skip dulu — ini yang akhirnya beresin {{pain}}.",
      "{{pronoun}} yang lagi ngalamin {{pain}}, wajib tahu ini.",
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
    shots: [
      "Medium shot, single continuous shot, no jump cuts.\n" +
      "The talent sits relaxed, gestures with one hand while speaking, and lets\n" +
      "the frustration show with a small eye-roll at the memory, natural unposed\n" +
      "body language.",
      "Close-up on the talent's face, single continuous shot, no jump cuts.\n" +
      "The talent recalls the frustration with a tired half-laugh, eyes briefly\n" +
      "casting away from the lens, hands restless.",
      "Medium shot from a slight high angle, single continuous shot.\n" +
      "The talent perches on the edge of the seat, shoulders dropping as the\n" +
      "memory lands, one hand rubbing the back of the neck.",
    ],
    settings: [
      "{{location}}, {{lighting}}",
      "{{location}}, {{lighting}}, a touch dimmer than the reveal scene",
      "A quieter corner of {{location}}, {{lighting}}",
    ],
    cameras: [
      "Static tripod framing with a very slow drift to the right, eye-level angle,\n" +
      "shallow depth of field, soft background separation.",
      "Very slow tilt from the eyes down to the clasped hands, static tripod,\n" +
      "shallow depth of field.",
      "Gentle handheld drift with a slow push-in, eye-level, natural movement.",
    ],
    sfxs: [
      "soft room tone, a faint sigh at the start of the line",
      "a soft exhale between sentences",
      "distant household ambience",
    ],
    musics: [
      "mellow lo-fi, slightly downbeat to match the frustration",
      "sparse piano notes, contemplative",
      "muted lo-fi beat at low energy",
    ],
    dialogueCandidates: [
      "Dulu aku tuh udah capek banget sama {{pain}} ini.",
      "Tiap hari ngadepin {{pain}}, sampai aku males bercermin.",
      "Kamu pernah nggak sih, udah usaha macem-macem tapi hasilnya tetap aja?",
      "Ini yang bikin aku frustrasi: {{pain}} nggak hilang-hilang.",
      "Aku udah keluar banyak uang, tapi nggak ada hasil yang bertahan.",
      "Semua orang ngasih saran, tapi masalah aku tetap sama.",
      "Aku sempat mikir, mungkin ini nggak bisa diatasin.",
      "Tiap pagi aku ngeluh soal hal yang sama terus.",
      "Sesama {{audience}}, aku yakin kamu juga capek ngadepin {{pain}}.",
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
    anchorMode: "frame",
    commands: ["/PRODUCTREVEAL", "/PRODUCTHERO", "/PRODUCTMACRO", "/PROPLOCK", "/LIGHTINGLOCK"],
    shots: [
      "Macro close-up, single continuous shot, no jump cuts.\n" +
      "{{product}} sits on a clean surface; the talent's hand enters frame and\n" +
      "gently lifts it, turning it slowly so the label catches the light.",
      "Macro close-up on a hero surface, single continuous shot.\n" +
      "{{product}} stands centred while a soft highlight sweeps across the label;\n" +
      "the talent's hand steadies it from behind.",
      "Close-up hero shot, single continuous shot, no jump cuts.\n" +
      "{{product}} rests on its box; the talent's hand turns it a quarter turn so\n" +
      "the label catches the key light.",
    ],
    settings: [
      "{{location}}, {{lighting}}, uncluttered hero surface",
      "A clean marble ledge in {{location}}, {{lighting}}, uncluttered hero surface",
      "{{location}}, {{lighting}}, warm hero backdrop with gentle falloff",
    ],
    cameras: [
      "Slow arc orbit around {{product}} from left to centre, rack focus from the\n" +
      "hand to the product label, shallow depth of field, crisp product detail.",
      "Slow push-in from close-up to macro on the label, rack focus from the\n" +
      "background to the product.",
      "Gentle top-down tilt revealing the product on the surface, crisp product\n" +
      "detail, shallow depth of field.",
    ],
    sfxs: [
      "delicate sparkle shimmer as the product turns into the light",
      "a soft rising chime as the label turns into the light",
      "a subtle airy swell under the reveal",
    ],
    musics: [
      "the lo-fi build resolves into a warm, hopeful chord",
      "a warm string swell that resolves softly",
      "gentle bell arpeggio with a hopeful lift",
    ],
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
    anchorMode: "frame",
    commands: ["/HOWTOUSE", "/BENEFITSAD", "/PRODUCTMACRO", "/CAMERALOCK"],
    /* Varian arc: isi slot DEMO tidak selalu "cara pakai" — bisa juga
     * perbandingan atau unboxing, supaya busur 6 scene tidak monoton.
     * Varian yang membawa `shot` menimpa bank shots di bawah. */
    arcVariants: [
      {
        id: "howto",
        label: "Cara Pakai",
        commands: ["/HOWTOUSE", "/BENEFITSAD", "/PRODUCTMACRO", "/CAMERALOCK"],
      },
      {
        id: "compare",
        label: "Bandingkan",
        commands: ["/BENEFITSAD", "/RESULTSHOT", "/PRODUCTROTATE", "/CAMERALOCK"],
        shot:
          "Close-up at hand height, single continuous shot, no jump cuts.\n" +
          "The talent holds {{product}} beside a plain unbranded alternative and taps\n" +
          "{{product}} first to show the difference, slow deliberate moves.",
      },
      {
        id: "unbox",
        label: "Unboxing",
        commands: ["/UGCUNBOXING", "/PRODUCTREVEAL", "/PRODUCTMACRO", "/PROPLOCK"],
        shot:
          "Close-up on the hands, single continuous shot, no jump cuts.\n" +
          "The talent slowly unboxes {{product}}, lifts it out of the packaging and\n" +
          "shows the first touch — {{usage}} — movements slow and deliberate.",
      },
    ],
    shots: [
      "Close-up, single continuous shot, no jump cuts.\n" +
      "The talent demonstrates how to use {{product}}: {{usage}}.\n" +
      "Hands stay in frame, movements are slow and deliberate.",
      "Over-the-shoulder close-up on the hands, single continuous shot.\n" +
      "The talent walks through {{usage}} in one clean motion, {{product}} held\n" +
      "steady so the label stays readable.",
      "Close-up at hand height, single continuous shot, no jump cuts.\n" +
      "The talent performs {{usage}} with unhurried precision, {{product}} filling\n" +
      "the lower half of the frame.",
    ],
    settings: [
      "{{location}}, {{lighting}}, clean surface with the product packaging nearby",
      "A tidy counter in {{location}}, {{lighting}}, clean surface with the product packaging nearby",
      "{{location}}, {{lighting}}, clean surface, only {{product}} in frame",
    ],
    cameras: [
      "Locked-off close-up on the hands and product with a slow 15-degree tilt,\n" +
      "sharp focus on the point of contact, shallow depth of field.",
      "Slow 15-degree tilt locked on the hands and product, sharp focus on the\n" +
      "point of contact.",
      "Static close-up with a gentle handheld float, shallow depth of field,\n" +
      "product label readable.",
    ],
    sfxs: [
      "subtle tactile sound of the product being opened or applied",
      "the soft click of the packaging opening",
      "light tap and texture sounds of the product in hand",
    ],
    musics: [
      "steady warm lo-fi, gentle forward momentum",
      "clean marimba motif, practical and bright",
      "light percussive loop at an easy pace",
    ],
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
    shots: [
      "Medium close-up, single continuous shot, no jump cuts.\n" +
      "The talent holds {{product}}, smiles with quiet confidence, nods slightly\n" +
      "while speaking, then lifts the product closer to the lens.",
      "Medium close-up, single continuous shot, no jump cuts.\n" +
      "The talent holds {{product}} at chest height, nods with certainty, then\n" +
      "angles the label toward the lens for a beat.",
      "Close-up from the chest up, single continuous shot.\n" +
      "The talent glances at {{product}}, back to the lens, and speaks with the\n" +
      "ease of someone recommending a find to a friend.",
    ],
    settings: [
      "{{location}}, {{lighting}}, same wardrobe and position as the hook scene",
      "{{location}}, {{lighting}}, same wardrobe as the hook scene",
      "A relaxed corner of {{location}}, {{lighting}}, same wardrobe as the hook scene",
    ],
    cameras: [
      "Gentle handheld push-in, eye-level, natural movement, product held in the\n" +
      "lower third of the frame to keep the face clearly visible.",
      "Slow steady push-in at eye level, product held in the lower third, face\n" +
      "clearly visible.",
      "Handheld with a gentle sway and a soft rack focus from the face to\n" +
      "{{product}} at the end.",
    ],
    sfxs: [
      "soft affirmative room tone, faint notification chime accent",
      "a soft notification chime on the key line",
      "warm room tone with a faint fabric rustle",
    ],
    musics: [
      "confident warm lo-fi, fuller arrangement than earlier scenes",
      "uplifted groove with light claps, assured and friendly",
      "steady guitar and light percussion, quietly convincing",
    ],
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
    shots: [
      "Medium shot, single continuous shot, no jump cuts.\n" +
      "The talent faces the lens, holds {{product}} beside the face, smiles warmly\n" +
      "and gestures toward the lower part of the frame where the button sits.",
      "Medium close-up, single continuous shot, no jump cuts.\n" +
      "The talent holds {{product}} close to the cheek, gives a small wave, and\n" +
      "nods toward the lower edge of the frame where the button sits.",
      "Medium shot, single continuous shot, no jump cuts.\n" +
      "The talent sets {{product}} down in the foreground, looks into the lens with\n" +
      "a warm final smile and gestures downward with an open palm.",
    ],
    settings: [
      "{{location}}, {{lighting}}, slightly tighter framing than previous scenes",
      "{{location}}, {{lighting}}, framing tightened on the talent",
      "{{location}}, {{lighting}}, product placed in the foreground",
    ],
    cameras: [
      "Slow steady push-in to medium close-up, locked horizon, product and face\n" +
      "both in frame, clean and stable final frame.",
      "Locked horizon with a slow push-in to medium close-up, stable final frame.",
      "Slow tilt down from the face to {{product}} in the foreground, ending on a\n" +
      "clean hold.",
    ],
    sfxs: [
      "bright confirm chime on the final beat",
      "a soft double-click accent as the gesture lands",
      "a gentle rising chime on the final beat",
    ],
    musics: [
      "uplifting resolve with a clear, warm ending",
      "bright ending sting with a clean stop",
      "warm resolve that fades out on the final smile",
    ],
    dialogueCandidates: [
      "Kalau kamu ngerasain hal yang sama, cobain deh.",
      "Langsung cek keranjang kuning sebelum promonya habis.",
      "Klik link di bio, masih ada diskon hari ini.",
      "Stoknya sering habis, jadi jangan sampai kehabisan.",
      "Cobain dulu, nanti kamu ngerti sendiri bedanya.",
      "Ambil sekarang selagi {{promo}} masih jalan.",
      "Buat {{audience}}, ambil sekarang selagi {{promo}}.",
      "{{pronoun}} yang penasaran, ambil sekarang sebelum kehabisan.",
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

/* =====================================================================
 * HOOK ANGLE — sudut cerita yang dipilih SEKALI per project dan dikunci
 * sama di 6 scene (lewat blok continuity). Inilah yang membuat dua
 * generate untuk produk sama terasa beda, bukan cuma dialognya.
 *
 * `directive`  -> arahan gaya (Inggris), masuk ke continuity block.
 * `hookCandidates` -> kandidat dialog Scene 1 khas angle ini (Indonesia),
 *                  bergabung dengan kandidat bawaan arketipe HOOK.
 * =================================================================== */
FA.HOOK_ANGLES = {
  curiosity: {
    id: "curiosity",
    label: "Penasaran",
    title: "Curiosity gap",
    directive: "open a loop — raise a question and withhold the answer until the reveal",
    hookCandidates: [
      "Ternyata ada satu hal yang selama ini bikin {{pain}} nggak beres.",
      "Kamu pasti penasaran kenapa akhirnya {{product}} ini yang aku pilih.",
    ],
  },

  relatable: {
    id: "relatable",
    label: "Relate Banget",
    title: "Relatable story",
    directive: "start from an everyday moment the viewer lives through, then turn it into the problem",
    hookCandidates: [
      "Tiap {{time}} aku ngalamin hal yang sama, dan kamu pasti juga.",
      "Cerita ini familiar banget buat kamu yang ngalamin {{pain}}.",
    ],
  },

  before_after: {
    id: "before_after",
    label: "Sebelum–Sesudah",
    title: "Before-after",
    directive: "contrast the before and after state from the first second, keep the transformation visible",
    hookCandidates: [
      "Dulu {{pain}}, sekarang beda banget semenjak pakai {{product}}.",
      "Lihat bedanya sebelum dan sesudah aku rutin pakai {{product}}.",
    ],
  },

  myth_bust: {
    id: "myth_bust",
    label: "Bantah Anggapan",
    title: "Myth-bust",
    directive: "challenge a common assumption first, then replace it with the real answer",
    hookCandidates: [
      "Anggapan soal {{pain}} itu ternyata salah besar.",
      "Stop percaya mitos ini — {{product}} bukan yang kamu kira.",
    ],
  },

  unboxing: {
    id: "unboxing",
    label: "Unboxing Pertama",
    title: "Unboxing reaction",
    directive: "capture genuine first-contact curiosity — eyes on the product, small honest reactions",
    hookCandidates: [
      "Baru nyampe, dan aku langsung penasaran sama {{product}} ini.",
      "Kita buka bareng-bareng ya, penasaran kan sama isinya.",
    ],
  },

  social_proof: {
    id: "social_proof",
    label: "Ikut Kata Orang",
    title: "Social proof",
    directive: "lead with what other people already experienced, then verify it yourself",
    hookCandidates: [
      "Banyak banget yang nanya, beneran nggak sih {{product}} ini sebagus itu?",
      "Katanya {{audience}} udah banyak yang pakai — aku buktiin sendiri.",
    ],
  },

  humor: {
    id: "humor",
    label: "Humor Ringan",
    title: "Humour",
    directive: "light self-deprecating humour, playful exaggeration kept believable",
    hookCandidates: [
      "Drama banget kan masalah aku soal {{pain}} ini.",
      "Muka santai tapi dalam hati panik — sampai nemu {{product}}.",
    ],
  },
};

FA.HOOK_ANGLE_ORDER = [
  "curiosity", "relatable", "before_after", "myth_bust", "unboxing", "social_proof", "humor",
];
