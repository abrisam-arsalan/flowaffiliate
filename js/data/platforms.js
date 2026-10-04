/* =========================================================================
 * FlowAffiliate — Platform, Voice Persona & Visual Style specs
 * Lihat PRD §8.6 (batasan platform) dan §5.2 (input brief).
 * ========================================================================= */

window.FA = window.FA || {};

/* -------------------------------------------------------------- Platform */
FA.PLATFORMS = {
  tiktok: {
    id: "tiktok",
    label: "TikTok",
    aspect: "9:16",
    captionMax: 2200,
    idealCaptionWords: [30, 55],
    hashtagCount: 4,
    hashtagNote: "3-5 hashtag. Lebih dari itu menurunkan jangkauan.",
    voice: "kasual, cepat, langsung ke poin, boleh pakai slang ringan",
    ctaStyle: "ajakan halus + rasa penasaran, hindari hard-sell",
    bestTime: "11.00–13.00 dan 19.00–22.00 WIB",
  },
  shopee: {
    id: "shopee",
    label: "Shopee Video",
    aspect: "9:16",
    captionMax: 1000,
    idealCaptionWords: [35, 70],
    hashtagCount: 5,
    hashtagNote: "4-6 hashtag, utamakan kata kunci pencarian produk.",
    voice: "deskriptif, jualan jelas, sebut manfaat dan promo",
    ctaStyle: "ajakan langsung + sebut keranjang kuning / link di bio",
    bestTime: "12.00–13.00 dan 20.00–22.00 WIB",
  },
  instagram: {
    id: "instagram",
    label: "Instagram Reels",
    aspect: "9:16",
    captionMax: 2200,
    idealCaptionWords: [25, 50],
    hashtagCount: 8,
    hashtagNote: "5-10 hashtag campuran broad, niche, dan lokal.",
    voice: "hangat, estetik, sedikit lebih santai dan personal",
    ctaStyle: "ajakan simpan & bagikan, lalu arahkan ke link di bio",
    bestTime: "11.00–13.00 dan 19.00–21.00 WIB",
  },
  youtube: {
    id: "youtube",
    label: "YouTube Shorts",
    aspect: "9:16",
    captionMax: 5000,
    idealCaptionWords: [20, 45],
    hashtagCount: 3,
    hashtagNote: "Maksimal 3 hashtag agar judul tidak terpotong.",
    voice: "jelas, informatif, mudah diikuti",
    ctaStyle: "ajakan subscribe + cek link di deskripsi",
    bestTime: "17.00–20.00 WIB",
  },
};

/* ---------------------------------------------------------- Voice Persona */
/* Field `directive` disuntikkan ke blok [AUDIO] prompt. Lihat PRD §6.1. */
FA.VOICES = {
  sahabat: {
    id: "sahabat",
    label: "Sahabat Hangat",
    gender: "female",
    descriptor: "Indonesian female voice, mid-20s",
    directive:
      "warm, friendly and conversational, like a close friend sharing a genuine find, natural pacing, no exaggerated salesmanship",
    fits: ["skincare", "home", "health", "universal"],
  },
  genz: {
    id: "genz",
    label: "Gen-Z Ceria",
    gender: "female",
    descriptor: "Indonesian female voice, early 20s",
    directive:
      "upbeat, energetic and fast-paced, playful tone, clear articulation, TikTok-native delivery, slight smile in the voice",
    fits: ["fashion", "skincare", "fnb", "gadget"],
  },
  ahli: {
    id: "ahli",
    label: "Ahli Terpercaya",
    gender: "male",
    descriptor: "Indonesian male voice, early 30s",
    directive:
      "calm, measured and confident, authoritative but not stiff, reassuring tone, deliberate emphasis on key benefits",
    fits: ["gadget", "health", "home"],
  },
  ibubijak: {
    id: "ibubijak",
    label: "Ibu Bijak",
    gender: "female",
    descriptor: "Indonesian female voice, late 30s",
    directive:
      "gentle, caring and reassuring, maternal warmth, unhurried pacing, speaks as if advising family",
    fits: ["home", "health", "fnb"],
  },
  reviewer: {
    id: "reviewer",
    label: "Reviewer Netral",
    gender: "male",
    descriptor: "Indonesian male voice, late 20s",
    directive:
      "casual, honest and matter-of-fact, like a trusted reviewer, avoids hype, slightly dry delivery",
    fits: ["gadget", "universal"],
  },
  misterius: {
    id: "misterius",
    label: "Penasaran Misterius",
    gender: "female",
    descriptor: "Indonesian female voice, mid-20s",
    directive:
      "low, intimate and intriguing, close-mic feel, deliberate pauses, builds curiosity before the reveal",
    fits: ["skincare", "fashion"],
  },
};

/* ---------------------------------------------------------- Visual Style */
FA.STYLES = {
  cinematic: {
    id: "cinematic",
    label: "Cinematic",
    grade: "warm cinematic grade, soft contrast, subtle film grain, shallow depth of field",
    camera: "smooth, deliberate camera moves on a gimbal",
  },
  ugc: {
    id: "ugc",
    label: "UGC Handheld",
    grade: "natural colour, slightly imperfect exposure, authentic smartphone look, no heavy grade",
    camera: "handheld with natural micro-shake, like a phone held at arm's length",
  },
  studio: {
    id: "studio",
    label: "Studio Clean",
    grade: "clean neutral grade, pure whites, crisp modern commercial look",
    camera: "locked-off tripod shots and slow motorised moves",
  },
  aesthetic: {
    id: "aesthetic",
    label: "Aesthetic",
    grade: "soft pastel grade, airy highlights, gentle film emulation, dreamy falloff",
    camera: "slow floating moves, gentle parallax",
  },
  homey: {
    id: "homey",
    label: "Homey Natural",
    grade: "warm lived-in tones, soft window light, cosy domestic feel",
    camera: "relaxed handheld, intimate framing",
  },
};

/* ------------------------------------------------------------- Preset Pace */
/* Durasi per scene (detik). Nilai harus salah satu dari 4/6/8/10 — batas
 * model Gemini Omni Flash. Lihat PRD §2.1. */
FA.PACING = {
  cepat:   { id: "cepat",   label: "Cepat",   durations: [4, 4, 4, 6, 4, 4],   note: "Cocok untuk hook cepat & retensi tinggi" },
  standar: { id: "standar", label: "Standar", durations: [8, 8, 6, 8, 8, 6],   note: "Seimbang, paling aman untuk konversi" },
  lengkap: { id: "lengkap", label: "Lengkap", durations: [10, 10, 8, 10, 10, 8], note: "Cerita lebih dalam, cocok untuk produk bernilai tinggi" },
};

/* ------------------------------------------------------- Batas word budget */
/* Ucapan bahasa Indonesia tempo natural ≈ 2,5 kata/detik. Lihat PRD §8.3. */
FA.WORDS_PER_SECOND = 2.5;

FA.wordBudget = function (seconds) {
  return Math.max(4, Math.floor(seconds * FA.WORDS_PER_SECOND));
};

/* Batas teks di layar: maksimal 5 kata per kemunculan. Lihat PRD §8.3. */
FA.ONSCREEN_MAX_WORDS = 5;

/* ----------------------------------------------------------------- Aspek */
FA.DEFAULT_ASPECT = "9:16";
