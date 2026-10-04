/* =========================================================================
 * FlowAffiliate — Command Library
 * Bank command prompt Google Flow, diadaptasi dari handbook
 * "1000 Google Flow Cheats" (UGC & Creator, Advertisement, Continuity Lock).
 *
 * Command di sini BUKAN ditulis ke dalam prompt. Command adalah tag internal
 * yang menentukan arketipe scene dan blok mana yang diaktifkan oleh
 * Prompt Assembler. Lihat PRD §6.3.
 * ========================================================================= */

window.FA = window.FA || {};

FA.COMMANDS = {
  /* ---------------------------------------------------------------- UGC */
  ugc: [
    { cmd: "/UGCINTRO",        fn: "Pembuka konten UGC yang natural dan menarik",        enables: ["hook", "talkingCam", "directToLens"] },
    { cmd: "/UGCHOOK",         fn: "Hook kuat di 3 detik pertama",                       enables: ["hook", "patternInterrupt"] },
    { cmd: "/UGCPRODUCTHOOK",  fn: "Menonjolkan produk secara natural",                  enables: ["productInHand", "closeUp"] },
    { cmd: "/UGCREVIEW",       fn: "Review jujur dan autentik",                          enables: ["testimonial", "beforeAfter"] },
    { cmd: "/UGCUNBOXING",     fn: "Adegan unboxing produk",                             enables: ["boxOpening", "reveal"] },
    { cmd: "/SELFIECAM",       fn: "Vlog gaya selfie kamera depan",                      enables: ["handheldSelfie"] },
    { cmd: "/TALKINGCAM",      fn: "Berbicara langsung ke kamera",                       enables: ["dialogueDriven"] },
    { cmd: "/INFLUENCERSTYLE", fn: "Gaya seperti influencer profesional",                enables: ["polishedUgc"] },
    { cmd: "/REACTIONVIDEO",   fn: "Reaksi spontan dan ekspresi nyata",                  enables: ["reaction", "cutaway"] },
    { cmd: "/UGCCTA",          fn: "Ajakan tindakan di akhir video",                     enables: ["ctaEndCard"] },
    { cmd: "/BEFOREAFTER",     fn: "Perbandingan sebelum dan sesudah",                   enables: ["splitTimeReveal"] },
    { cmd: "/PROBLEMSOLUTION", fn: "Menangkap masalah lalu solusinya",                   enables: ["problemArc"] },
    { cmd: "/LIFESTYLEUGC",    fn: "Menggunakan produk dalam aktivitas sehari-hari",     enables: ["lifestyleInsert"] },
    { cmd: "/TESTIMONIALUGC",  fn: "Testimoni pengguna nyata",                           enables: ["socialProof"] },
    { cmd: "/DAYINTHELIFE",    fn: "Aktivitas harian dengan produk",                     enables: ["dayInLifeMontage"] },
    { cmd: "/HOWTOUSE",        fn: "Tutorial cara penggunaan",                           enables: ["demoHand", "product"] },
    { cmd: "/TIPSANDTRICK",    fn: "Memberikan tips yang bermanfaat",                    enables: ["valueFirst"] },
    { cmd: "/UGCVARIATION",    fn: "Menampilkan beberapa variasi produk",                enables: ["multiProductLineup"] },
    { cmd: "/CLOSEUPSHOT",     fn: "Close up detail produk",                             enables: ["macroDetail"] },
    { cmd: "/AESTHETICUGC",    fn: "Konten dengan visual estetik",                       enables: ["aestheticFlatlay"] },
    { cmd: "/TRENDAUDIO",      fn: "Menggunakan gaya video dengan audio trend",          enables: ["beatSyncedCut"] },
    { cmd: "/UGCEDITSTYLE",    fn: "Gaya editing UGC cepat, dinamis, modern",            enables: ["fastCutRhythm"] },
    { cmd: "/HASHTAGSHOT",     fn: "Adegan dengan teks hashtag relevan",                 enables: ["onscreenHashtag"] },
    { cmd: "/LIFESTYLESHOT",   fn: "Produk dalam aktivitas sehari-hari",                 enables: ["contextualInsert"] },
    { cmd: "/RESULTSHOT",      fn: "Hasil dan manfaat produk dengan visual jelas",       enables: ["resultProof"] },
    { cmd: "/SCENICUGC",       fn: "Konten di lokasi menarik",                           enables: ["locationDriven"] },
    { cmd: "/TRENDSTYLE",      fn: "Mengikuti tren yang sedang viral",                   enables: ["trendTemplate"] },
    { cmd: "/CHALLENGEUGC",    fn: "Konten tantangan",                                   enables: ["challengeFormat"] },
    { cmd: "/DUETREACTION",    fn: "Reaksi atau duet style",                             enables: ["splitScreenReaction"] },
    { cmd: "/VOICEOVERUGC",    fn: "Narasi dengan voice over",                           enables: ["voDriven"] },
    { cmd: "/TEXTOVERLAY",     fn: "Menambahkan teks informasi",                         enables: ["textOverlay"] },
    { cmd: "/BROLLUGC",        fn: "Adegan tambahan B-roll",                             enables: ["brollInsert"] },
    { cmd: "/TRANSITIONUGC",   fn: "Transisi kreatif antar adegan",                      enables: ["transitionShot"] },
    { cmd: "/MULTIANGLE",      fn: "Menampilkan beberapa sudut kamera",                  enables: ["multiAngle"] },
    { cmd: "/ENDINGBRAND",     fn: "Penutup dengan tampilan logo atau brand",            enables: ["logoEndCard"] },
  ],

  /* -------------------------------------------------------- Advertisement */
  ad: [
    { cmd: "/ADINTRO",       fn: "Membuka video iklan dengan tampilan menarik dan profesional", enables: ["hook", "polished"] },
    { cmd: "/ADHOOK",        fn: "Pembuka kuat untuk menarik perhatian penonton",               enables: ["hook", "patternInterrupt"] },
    { cmd: "/UGCHOOK",       fn: "Pembuka gaya UGC natural dan relatable",                      enables: ["hook", "relatable"] },
    { cmd: "/PRODUCTHOOK",   fn: "Menampilkan produk dengan cara menarik dan menggugah minat",  enables: ["productInHand"] },
    { cmd: "/PRODUCTHERO",   fn: "Produk sebagai hero shot dengan visual premium",              enables: ["heroShot"] },
    { cmd: "/PRODUCTREVEAL", fn: "Menampilkan produk bertahap dengan efek reveal sinematik",    enables: ["cinematicReveal"] },
    { cmd: "/PRODUCTMACRO",  fn: "Close-up detail produk secara jelas",                         enables: ["macroDetail"] },
    { cmd: "/PRODUCTROTATE", fn: "Menampilkan produk berputar 360 derajat",                     enables: ["rotationShot"] },
    { cmd: "/PRODUCTLIGHT",  fn: "Pencahayaan profesional yang menonjolkan produk",             enables: ["studioLight"] },
    { cmd: "/LOGOREVEAL",    fn: "Logo brand dengan animasi profesional dan elegan",            enables: ["logoReveal"] },
    { cmd: "/PHOTOSHOOTAD",  fn: "Adegan pemotretan produk dengan pencahayaan studio",          enables: ["studioLight", "macroDetail"] },
    { cmd: "/PACKSHOT",      fn: "Menampilkan kemasan produk secara lengkap",                   enables: ["packagingShot"] },
    { cmd: "/CINEMATICAD",   fn: "Iklan gaya sinematik dengan storytelling kuat",               enables: ["cinematic"] },
    { cmd: "/CTAEND",        fn: "Menutup iklan dengan ajakan yang jelas",                      enables: ["ctaEndCard"] },
    { cmd: "/TESTIMONIALAD", fn: "Testimoni pengguna dengan gaya natural dan meyakinkan",       enables: ["socialProof"] },
    { cmd: "/BENEFITSAD",    fn: "Menampilkan keunggulan dan manfaat produk",                   enables: ["benefitStack"] },
    { cmd: "/LIFESTYLEAD",   fn: "Produk dalam kehidupan sehari-hari yang relevan",             enables: ["lifestyleInsert"] },
    { cmd: "/BRANDSTORY",    fn: "Cerita dan nilai brand secara emosional dan inspiratif",      enables: ["emotionalStory"] },
    { cmd: "/MASTERAD",      fn: "Paket lengkap adegan iklan dari pembuka hingga penutup",      enables: ["fullArc"] },
  ],

  /* ---------------------------------------------- Continuity Lock (kunci) */
  lock: [
    { cmd: "/MASTERCONTINUITY", fn: "Menjaga konsistensi karakter, tempat, gaya di semua adegan", block: "GLOBAL" },
    { cmd: "/CHARACTERLOCK",    fn: "Mengunci identitas karakter agar tidak berubah",             block: 2 },
    { cmd: "/FACELOCK",         fn: "Menjaga wajah tetap sama di semua adegan",                   block: 2 },
    { cmd: "/AGELOCK",          fn: "Menjaga usia karakter tetap konsisten",                      block: 2 },
    { cmd: "/WARDROBELOCK",     fn: "Mengunci pakaian dan aksesoris",                             block: 2 },
    { cmd: "/PROPLOCK",         fn: "Menjaga properti yang sama di setiap adegan",                block: 2 },
    { cmd: "/LOCATIONLOCK",     fn: "Mengunci lokasi dan setting",                                block: 2 },
    { cmd: "/BACKGROUNDLOCK",   fn: "Menjaga latar belakang tidak berubah",                       block: 2 },
    { cmd: "/LIGHTINGLOCK",     fn: "Menjaga gaya pencahayaan konsisten",                         block: 2 },
    { cmd: "/CAMERALOCK",       fn: "Menjaga sudut kamera dan jenis shot",                        block: 5 },
    { cmd: "/WEATHERLOCK",      fn: "Mengunci kondisi cuaca dan suasana",                         block: 4 },
    { cmd: "/VOICELOCK",        fn: "Menjaga karakter suara atau dubbing tetap sama",             block: 6 },
    { cmd: "/AUDIOLOCK",        fn: "Menjaga musik, efek suara, kualitas audio konsisten",        block: 6 },
    { cmd: "/STYLELOCK",        fn: "Menjaga gaya visual, warna, tone sinematik",                 block: 2 },
    { cmd: "/SCENECONTINUE",    fn: "Melanjutkan adegan sebelumnya dengan mulus",                  block: 2 },
  ],
};

/* Indeks cepat: cmd -> objek command */
FA.COMMAND_INDEX = (function () {
  var idx = {};
  ["ugc", "ad", "lock"].forEach(function (group) {
    FA.COMMANDS[group].forEach(function (c) { idx[c.cmd] = c; });
  });
  return idx;
})();

FA.lookupCommand = function (cmd) {
  return FA.COMMAND_INDEX[cmd] || null;
};
