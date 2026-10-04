# PRD — FlowAffiliate
## Aplikasi Generator Prompt Video Affiliate untuk Google Flow + Omni Flash

| Field | Value |
|---|---|
| Nama Produk | **FlowAffiliate** (working title) |
| Versi Dokumen | 1.0 |
| Tanggal | 3 Oktober 2026 |
| Status | Draft untuk review |
| Jenis Produk | Web App (mobile-first, PWA) |
| Target Rilis MVP | 6 minggu |
| Dokumen Terkait | — |

---

## 1. Ringkasan Eksekutif

**FlowAffiliate** adalah aplikasi web yang mengubah **satu foto/video produk** menjadi **paket konten affiliate siap posting** berisi:

1. **6 prompt scene** berbahasa Indonesia siap copy-paste ke Google Flow (model **Gemini Omni Flash**)
2. **Narasi/voice-over bahasa Indonesia** dengan gaya bahasa yang memancing rasa penasaran dan minat beli (hook-driven)
3. **Caption + hashtag** yang selaras per platform (TikTok, Shopee Video, Instagram Reels, YouTube Shorts)

**Masalah yang diselesaikan:** Affiliate Indonesia tahu Google Flow bisa bikin video produk tanpa syuting, tapi mereka tidak tahu *apa yang harus ditulis*. Prompt asal-asalan menghasilkan video generik, wajah karakter berubah-ubah antar scene, dan narasi bahasa Indonesia yang kaku. Akibatnya konten tidak FYP dan tidak konversi.

**Solusi:** FlowAffiliate menyediakan **mesin prompt terstruktur** berbasis library command UGC & Advertisement (100+ command), teknik **continuity lock** (CharacterLock, FaceLock, LocationLock), dan **hook psychology Indonesia** — sehingga pengguna hanya perlu upload produk dan klik Generate.

**Diferensiasi:** Bukan sekadar "AI bikin prompt acak". Ini adalah **knowledge base prompt Google Flow** yang dikodifikasi menjadi produk — outputnya deterministik, konsisten, dan sudah lolos uji struktur teknis Omni Flash (durasi, aspect ratio, single-shot instruction, format dialog).

---

## 2. Latar Belakang & Konteks Pasar

### 2.1 Kenapa Google Flow + Omni Flash

Google Flow adalah AI creative studio dari Google yang mendukung text-to-video, image-to-video, dan ingredients-to-video. [cite:29724849-5] Sejak Mei 2026, Flow menjalankan **Gemini Omni Flash**, model yang menggabungkan kecerdasan Gemini dengan model generative media — digambarkan sebagai "Nano Banana tapi untuk video". [cite:50a7fe93-2]

Kapabilitas Omni Flash yang menjadi dasar desain produk ini:

| Kapabilitas | Implikasi untuk FlowAffiliate |
|---|---|
| Text-to-Video, Frames-to-Video, Ingredients-to-Video, Video-to-Video editing | User bisa pakai foto produk sebagai ingredient/frame [cite:c36d8da9-3] |
| Durasi 4s, 6s, 8s, **10s** | Prompt harus menyatakan durasi & pacing yang cocok |
| Kedua aspect ratio (16:9 & 9:16) | Default 9:16 untuk TikTok/Reels/Shorts |
| **Character & voice consistency** di setiap scene | Memungkinkan serial 6 scene dengan karakter sama [cite:50a7fe93-2] |
| Generate audio native (dialog, SFX, ambience) | Narasi bahasa Indonesia bisa diminta langsung di prompt |
| Custom voice / pilih suara preset Indonesia | Fitur "suara menarik" dapat dicapai tanpa dubbing eksternal [cite:805d950f-1] |
| Upscale 1080p / 4K | Output layak untuk iklan berbayar [cite:805d950f-2] |
| Conversational editing | User bisa iterasi "buat lebih hangat", "perlambat" |

### 2.2 Kenapa Affiliate Indonesia Butuh Ini

- Google Flow bisa dipakai **tanpa memiliki produk fisik** — cukup foto produk → visualisasi AI. [cite:670bd055-1]
- Biaya produksi video iklan konvensional (kamera, talent, studio, editing) tidak terjangkau affiliate pemula.
- Prompt bisa **bilingual** dan yang terpenting detail; kreator Indonesia banyak mencari contoh prompt bahasa Indonesia untuk relevansi pasar lokal. [cite:670bd055-2]
- Kendala nyata: **konsistensi wajah & karakter antar scene** adalah pain point #1 — ini persis yang disorot oleh materi edukasi "Continuity Paling Ketat" dan "Cheats Google Flow agar wajah dapat konsisten".

### 2.3 Gap yang Diisi

| Kondisi Sekarang | Setelah FlowAffiliate |
|---|---|
| Prompt ditulis manual, coba-coba, hasil acak | Prompt terstruktur dari library 100+ command |
| Wajah karakter berubah tiap scene | Continuity lock block otomatis di tiap prompt |
| Narasi bahasa Indonesia kaku / hasil translate | Narasi ditulis native dengan hook psychology |
| Caption dan video tidak nyambung | Caption di-generate dari narasi & angle yang sama |
| Prompt bahasa Indonesia sering tidak diindahkan | Prompt bilingual: struktur teknis Inggris + dialog Indonesia dalam tanda kutip |

---

## 3. Tujuan & Metrik Keberhasilan

### 3.1 Tujuan Produk

1. Memangkas waktu produksi konten affiliate dari **2–3 jam** menjadi **< 10 menit** per video.
2. Menghasilkan prompt yang **langsung bisa dipakai** di Google Flow tanpa edit berarti (target: 80% prompt di-generate tanpa revisi manual).
3. Menjaga **konsistensi karakter & wajah** di 6 scene (target: skor konsistensi ≥ 8/10 dari review pengguna).
4. Menghasilkan narasi + caption Indonesia yang **mendorong engagement** (target: CTR/CVR konten lebih baik dari baseline kreator).

### 3.2 Metrik Keberhasilan (MVP — 90 hari)

| Metrik | Target | Cara Ukur |
|---|---|---|
| Activation rate (upload → generate 6 prompt) | ≥ 65% | Analytics event funnel |
| Sesi generate sukses per user/minggu | ≥ 3 | Analytics |
| Copy-to-Flow rate (user klik "Copy Prompt") | ≥ 85% per sesi | Event tracking |
| Prompt acceptance rate (tanpa regenerate) | ≥ 70% | Rasio generate pertama vs total |
| Rata-rata waktu sesi generate | < 10 menit | Timestamp |
| D7 retention | ≥ 25% | Cohort analytics |
| NPS | ≥ 40 | In-app survey |

### 3.3 Non-Goals (Fase MVP)

- ❌ Tidak memanggil Gemini API untuk generate video (tidak ada biaya GPU, tidak ada queue)
- ❌ Tidak menjadi platform hosting video
- ❌ Tidak melakukan auto-upload ke TikTok/Shopee (belum ada API resmi yang feasible)
- ❌ Tidak menyediakan editor video (arahkan user ke CapCut)

---

## 4. Persona Pengguna

### Persona 1 — **Rina, Affiliate Shopee Pemula** (Primary)
- **Usia:** 24 | **Lokasi:** Bandung | **Device:** Android mid-range
- **Konteks:** Baru 3 bulan jadi affiliate. Belum punya kamera, belum nyaman on-camera. Produk: skincare lokal.
- **Tujuan:** Bikin 3–5 video/minggu untuk Shopee Video & TikTok tanpa harus beli produk & syuting.
- **Pain:** Prompt bahasa Inggris bikin pusing. Sering bingung scene-nya harus apa saja. Hasil video: wajah beda-beda tiap scene.
- **Kutipan:** *"Aku taunya Flow bisa bikin video, tapi aku nggak tau mau nulis apa. Ngetik prompt terus hasilnya nggak sesuai. Habis poin."*

### Persona 2 — **Bagas, Creator UGC Freelance** (Secondary)
- **Usia:** 29 | **Lokasi:** Surabaya | **Device:** Laptop + iPhone
- **Konteks:** Terima order UGC dari brand. Klien minta 3 variasi hook per produk.
- **Tujuan:** Produksi cepat, bisa A/B test hook, output konsisten dengan brand guideline.
- **Pain:** Butuh variasi angle cepat. Klien sering minta revisi karena karakter tidak konsisten.
- **Kutipan:** *"Klien gue minta 5 versi hook beda. Kalau manual, seharian nggak kelar."*

### Persona 3 — **Dewi, Social Media Admin UMKM** (Tertiary)
- **Usia:** 34 | **Lokasi:** Jakarta | **Device:** Windows laptop
- **Konteks:** Kelola IG & TikTok untuk brand lokal, tim hanya dia sendiri.
- **Tujuan:** Konten produk yang rapi dan bisa dipakai untuk iklan berbayar.
- **Pain:** Tidak punya skill copywriting. Caption selalu generik.

### Jobs To Be Done

> Ketika saya punya **foto produk** dan ingin membuat **video affiliate untuk sosial media**, saya ingin **mendapat prompt siap pakai + narasi + caption sekaligus**, supaya saya bisa **posting cepat dan hasilnya menjual** — tanpa harus belajar prompt engineering atau syuting.

---

## 5. Alur Aplikasi (User Flow)

### 5.1 Alur Utama (Happy Path)

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. INPUT                                                         │
│    Upload gambar / video produk (drag-drop atau kamera)          │
│    + isi brief singkat (nama produk, kategori, harga, target)    │
└───────────────────────────┬──────────────────────────────────────┘
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│ 2. ANALISIS (AI Vision + Conductor Engine)                       │
│    Deteksi: kategori produk, warna dominan, material, mood       │
│    Pilih: playbook affiliate + 6 scene template yang cocok       │
└───────────────────────────┬──────────────────────────────────────┘
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│ 3. OUTPUT: 6 PROMPT SCENE                                        │
│    Scene 1 (Hook) · Scene 2 (Problem) · Scene 3 (Reveal)         │
│    Scene 4 (Demo/Benefit) · Scene 5 (Bukti Sosial) · Scene 6 (CTA)│
│    Masing-masing: prompt EN+ID, narasi ID, on-screen text, SFX    │
│    [Copy] [Copy Semua] [Regenerate Scene]                        │
└───────────────────────────┬──────────────────────────────────────┘
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│ 4. OUTPUT: CAPTION & HASHTAG                                     │
│    Caption per platform (TikTok / Shopee Video / IG / YT Shorts) │
│    3 varian hook · hashtag set · CTA link                        │
└───────────────────────────┬──────────────────────────────────────┘
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│ 5. EXPORT                                                        │
│    Copy semua · Download .txt / .md · Simpan ke Library         │
└──────────────────────────────────────────────────────────────────┘
```

### 5.2 Detail Setiap Langkah

#### **Langkah 1 — Upload Gambar/Video Produk**

**Aksi pengguna:**
- Upload 1–5 file: foto produk (JPG/PNG/WebP), maks 10 MB per file
- Opsional: upload foto model/referensi karakter (untuk FaceLock)
- Opsional: upload video produk yang sudah ada

**Input brief (form ringkas, semua pre-filled dari AI vision, user bisa koreksi):**

| Field | Wajib | Contoh |
|---|---|---|
| Nama produk | ✅ | "Beauty Glow Serum Vitamin C" |
| Kategori | ✅ | Skincare / Fashion / F&B / Gadget / Home / Kesehatan |
| Harga & promo | ⬜ | "Rp 89.000, diskon 40% jadi Rp 53.400" |
| Target audiens | ⬜ | "Wanita 20–30, kulit kusam, kerja kantoran" |
| Pain point utama | ⬜ | "Kulit kusam & berminyak di siang hari" |
| Platform tujuan | ✅ | TikTok / Shopee Video / IG Reels / YT Shorts |
| Bahasa narasi | ✅ default | Indonesia (opsional: Indonesia + Inggris) |
| Gaya visual | ✅ default | Cinematic / UGC Handheld / Studio Clean / Aesthetic |
| Durasi per scene | ✅ default | 8 detik (opsi: 4/6/8/10) |
| Gender & tone suara | ⬜ | Wanita, ramah & antusias |
| Link affiliate | ⬜ | Shopee/TikTok affiliate link |

#### **Langkah 2 — Analisis Otomatis**

Sistem menjalankan **Product Analyzer** (vision model):

```
OUTPUT ANALISIS:
├── product_type: "skincare serum, botol kaca dengan dropper, label putih-emas"
├── dominant_colors: ["#F5F0E8", "#C9A961", "#FFFFFF"]
├── material_texture: "kaca transparan, cairan bening, tutup logam emas"
├── inferred_category: "Skincare > Serum > Brightening"
├── suggested_mood: "clean, premium, calm, trustworthy"
├── suggested_audience: "Wanita 20–35, urban, peduli penampilan"
└── best_playbook: "SKINCARE_BEFORE_AFTER_v3"
```

**Playbook Selector** memilih dari library (lihat §7) 6 scene yang paling cocok.

> **Fallback:** Jika vision confidence < 0.6, sistem tetap jalan dengan playbook generik `UNIVERSAL_AFFILIATE_v1` dan menandai field yang perlu dikonfirmasi user.

#### **Langkah 3 — Output 6 Prompt Scene**

Setiap scene ditampilkan sebagai **kartu** dengan struktur:

```
┌──────────────────────────────────────────────────────────┐
│ SCENE 1 / 6                          [HOOK]      ⏱ 8s   │
│ Command: /ADHOOK + /UGCINTRO + /FACELOCK                 │
├──────────────────────────────────────────────────────────┤
│ 📋 PROMPT (copy ke Google Flow)                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ [Bahasa teknis Inggris + dialog Indonesia]           │ │
│ │ ...                                                  │ │
│ └──────────────────────────────────────────────────────┘ │
│                                          [Copy] [🔄]     │
├──────────────────────────────────────────────────────────┤
│ 🎙️ NARASI (Voice-Over Indonesia)          [Copy]         │
│ "..."                                                    │
├──────────────────────────────────────────────────────────┤
│ 💬 ON-SCREEN TEXT                         [Copy]         │
│ ""..."                                                   │
├──────────────────────────────────────────────────────────┤
│ 🔊 SFX / MUSIC · 🎬 Kamera · ⚙️ Setelan Flow            │
└──────────────────────────────────────────────────────────┘
```

Tombol global: **[Copy Semua 6 Prompt]** · **[Regenerate Semua]** · **[Ganti Playbook]**

#### **Langkah 4 — Caption & Hashtag**

Satu tab berisi:

- **3 varian hook caption** (curiosity / pain / social proof) — user pilih satu
- **Caption lengkap** menyesuaikan platform terpilih (panjang berbeda: TikTok lebih pendek, Shopee Video lebih deskriptif-jualan)
- **Hashtag set**: 5 broad + 5 niche + 3 lokal (mis. `#racunskincare #skincarelokal #reviewjujur`)
- **CTA line** yang bisa dipasang link affiliate
- **Best posting time** (opsional, berdasarkan kategori)

#### **Langkah 5 — Export**

- Copy individual / copy all
- Download `.txt` atau `.md` berisi seluruh paket (prompt + narasi + caption)
- Simpan ke **Library** (riwayat project, bisa dibuka & di-regenerate)

---

## 6. Arsitektur Prompt — Inti Produk

Ini adalah bagian paling penting dari PRD. Kualitas output ditentukan oleh struktur ini.

### 6.1 Anatomi Prompt Satu Scene (7 Blok Wajib)

Berdasarkan panduan resmi Flow/Veo (subject & action, composition & camera, location & lighting, audio & dialogue) [cite:2c15baf8-1] dan panduan Omni Flash (seluruh scene, single-shot instruction, direct the audio, on-screen text dalam tanda kutip, time-blocking) [cite:50a7fe93-1], setiap prompt scene **wajib** memuat 7 blok berikut:

| # | Blok | Fungsi | Bahasa |
|---|---|---|---|
| 1 | **REFERENCE DECLARATION** | Menyatakan peran setiap gambar yang di-upload sebagai ingredient/reference | Inggris |
| 2 | **CONTINUITY LOCK** | Mengunci identitas, wajah, wardrobe, lokasi, lighting agar konsisten antar scene | Inggris |
| 3 | **SHOT & SUBJECT** | Subjek, aksi, framing (wide/medium/close-up), satu shot kontinu | Inggris |
| 4 | **SETTING & LIGHTING** | Lokasi konkret + mood pencahayaan (bukan sekadar "ruangan") | Inggris |
| 5 | **CAMERA MOTION** | Gerakan kamera eksplisit (slow push-in, handheld tracking, orbit) | Inggris |
| 6 | **AUDIO & DIALOGUE** | Ambience, SFX, musik, dan **dialog Indonesia dalam tanda kutip** dengan arahan tone | Indonesia (dialog) + Inggris (arahan) |
| 7 | **ON-SCREEN TEXT & TIMING** | Teks di layar dalam tanda kutip + timecode bila perlu | Indonesia |

**Prinsip struktural:**
- **Bahasa teknis Inggris, konten linguistik Indonesia.** Model menaati instruksi sinematik lebih baik dalam Inggris, sementara dialog & teks di layar harus Indonesia agar pengucapan dan rendering teks akurat. Omni Flash menerima prompt bilingual selama detail. [cite:670bd055-2]
- **Dialog selalu dalam tanda kutip** dan diberi arahan emosi + tempo. Teks di layar pendek dan dalam tanda kutip — teks panjang lebih sering salah render. [cite:50a7fe93-1]
- **Satu scene = satu shot kontinu.** Secara default Omni Flash membangun narasi dari beberapa shot; untuk hasil bersih harus dinyatakan "single continuous shot" / "no jump cuts". [cite:50a7fe93-1][cite:805d950f-2]

### 6.2 Contoh Prompt Lengkap — Scene 1 (Hook)

```
[REFERENCE]
Use the uploaded product image as the primary product reference.
Use the uploaded character photo as the identity reference for the talent.

[CONTINUITY LOCK — apply to all 6 scenes]
Character: same woman, early 20s, Indonesian, warm medium skin tone,
straight black hair tied in a low bun, natural makeup, no glasses.
Wardrobe: soft cream linen shirt, thin gold necklace.
Location: modern minimalist bedroom with large window, white sheer curtain,
warm morning light from camera-left.
Color grade: warm neutral, soft contrast, slight film grain.
Keep face, wardrobe, location, and lighting IDENTICAL across all scenes.

[SHOT]
Medium close-up, single continuous shot, no jump cuts.
The woman sits on the edge of the bed, holds the product at eye level,
looks directly into the lens, and speaks with a slightly surprised,
curious expression. She tilts the bottle gently to catch the light.

[SETTING & LIGHTING]
Late morning, golden natural light through the window,
soft shadow falloff, clean uncluttered background with a blurred plant.

[CAMERA]
Slow push-in from medium close-up to close-up over 8 seconds,
subtle handheld micro-movement, shallow depth of field,
product label stays in sharp focus.

[AUDIO]
Ambience: quiet room tone, faint birdsong outside.
Music: soft uplifting lo-fi with a light build, no drums in first 2 seconds.
Dialogue — Indonesian, female voice, warm, energetic, conversational pace,
speaking directly to the viewer:
"Eh, kulit aku dulu kusam banget, sampai aku nemu satu produk ini."
SFX: gentle whoosh at the 6-second mark as the product lifts.

[ON-SCREEN TEXT]
Show the text "Kulit Kusam? Coba Ini" in clean white sans-serif,
bottom-center, appears at 1 second, stays until end.
Text must be spelled exactly as written, in Indonesian.

[OUTPUT SETTINGS]
Duration: 8 seconds · Aspect ratio: 9:16 · Model: Gemini Omni Flash
```

### 6.3 Bank Command (Prompt Shortcut Library)

Diadaptasi dari handbook "1000 Google Flow Cheats" yang menjadi referensi produk ini. Command dipakai sebagai **tag internal** untuk memilih scene archetype — bukan ditulis ke prompt, tapi menentukan blok mana yang diaktifkan.

#### A. UGC & Creator Commands

| Command | Fungsi | Blok yang diaktifkan |
|---|---|---|
| `/UGCINTRO` | Pembuka konten UGC natural & menarik | Hook, talking cam, direct-to-lens |
| `/UGCHOOK` | Hook kuat di 3 detik pertama | Hook + pattern interrupt |
| `/UGCPRODUCHOOK` | Menonjolkan produk secara natural | Product-in-hand, close-up |
| `/UGCREVIEW` | Review jujur dan autentik | Testimonial, before-after |
| `/UGCUNBOXING` | Adegan unboxing produk | Box opening, reveal |
| `/SELFIECAM` | Vlog gaya selfie kamera depan | Handheld selfie framing |
| `/TALKINGCAM` | Berbicara langsung ke kamera | Dialogue-driven |
| `/INFLUENCERSTYLE` | Gaya influencer profesional | Polished UGC |
| `/REACTIONVIDEO` | Reaksi spontan dan ekspresif | Reaction + cutaway |
| `/UGCCTA` | Ajakan tindakan di akhir video | CTA end card |
| `/BEFOREAFTER` | Perbandingan sebelum dan sesudah | Split-time reveal |
| `/PROBLEMSOLUTION` | Menangkap masalah lalu solusinya | Problem → solution arc |
| `/LIFESTYLEUGC` | Produk dalam aktivitas sehari-hari | Lifestyle insert |
| `/TESTIMONIALUGC` | Testimoni pengguna nyata | Social proof |
| `/DAYINTHELIFE` | Aktivitas harian dengan produk | Day-in-life montage |
| `/HOWTOUSE` | Tutorial cara penggunaan | Demo hand + product |
| `/TIPSDANTRICK` | Tips bermanfaat | Value-first content |
| `/UGCVARIATION` | Beberapa variasi produk | Multi-product lineup |
| `/CLOSEUPSHOT` | Close up detail produk | Macro detail |
| `/AESTHETICUGC` | Konten dengan visual estetik | Aesthetic flatlay/motion |
| `/TRENDAUDIO` | Gaya video dengan audio trending | Beat-synced cutting |
| `/UGCEDITSTYLE` | Gaya editing UGC cepat & dinamis | Fast cut rhythm |
| `/HASHTAGSHOT` | Teks hashtag di layar | On-screen hashtag |
| `/LIFESTYLESHOT` | Produk dalam aktivitas sehari-hari | Contextual insert |
| `/RESULTSHOT` | Hasil dan manfaat produk | Result proof |
| `/SCENICUGC` | Konten di lokasi menarik | Location-driven |
| `/TRENDSTYLE` | Mengikuti tren viral | Trend template |
| `/CHALLENGEUGC` | Konten tantangan | Challenge format |
| `/DUETREACTION` | Reaksi atau duet style | Split-screen reaction |
| `/VOICEOVERUGC` | Narasi dengan voice over | VO-driven |
| `/TEXTOVERLAY` | Menambahkan teks informasi | Text overlay |
| `/BROLLUGC` | Adegan tambahan B-roll | B-roll insert |
| `/TRANSITIONUGC` | Transisi kreatif antar adegan | Transition shot |
| `/MULTIANGLE` | Beberapa sudut kamera | Multi-angle coverage |
| `/ENDINGBRAND` | Penutup dengan tampilan logo/brand | Logo end card |

#### B. Advertisement Commands

| Command | Fungsi |
|---|---|
| `/ADINTRO` | Membuka video iklan dengan tampilan menarik & profesional |
| `/ADHOOK` | Pembuka kuat untuk menarik perhatian penonton |
| `/UGCHOOK` | Pembuka gaya UGC natural & relatable |
| `/PRODUCTHOOK` | Menampilkan produk dengan cara menarik |
| `/PRODUCTHERO` | Produk sebagai hero shot dengan visual premium |
| `/PRODUCTREVEAL` | Menampilkan produk bertahap dengan efek reveal sinematik |
| `/PRODUCTMACRO` | Close-up detail produk secara jelas |
| `/PRODUCTROTATE` | Menampilkan produk berputar 360° |
| `/PRODUCTLIGHT` | Pencahayaan profesional yang menonjolkan produk |
| `/LOGOREVEAL` | Logo brand dengan animasi profesional dan elegan |
| `/PHOTOSHOOTAD` | Adegan pemotretan produk dengan pencahayaan studio |
| `/PACKSHOT` | Menampilkan kemasan produk secara lengkap |
| `/CINEMATICAD` | Adegan iklan gaya sinematik dengan storytelling kuat |
| `/CTAEND` | Menutup iklan dengan ajakan yang jelas |
| `/TESTIMONIALAD` | Testimoni pengguna dengan gaya natural dan meyakinkan |
| `/BENEFITSAD` | Menampilkan keunggulan dan manfaat produk |
| `/LIFESTYLEAD` | Produk dalam kehidupan sehari-hari yang relevan |
| `/BRANDSTORY` | Cerita dan nilai brand secara emosional dan inspiratif |
| `/MASTERAD` | Paket lengkap adegan iklan pembuka hingga penutup |

#### C. Continuity Lock Commands

Ini adalah **keunggulan kompetitif teknis** produk — menjawab pain point konsistensi wajah.

| Command | Fungsi | Diterapkan pada |
|---|---|---|
| `/MASTERCONTINUITY` | Menjaga konsistensi karakter, tempat, gaya di semua adegan | Global (semua scene) |
| `/CHARACTERLOCK` | Mengunci identitas karakter agar tidak berubah | Blok 2 |
| `/FACELOCK` | Menjaga wajah tetap sama di semua adegan | Blok 2 |
| `/AGELOCK` | Menjaga usia karakter tetap konsisten | Blok 2 |
| `/WARDROBEBLOCK` | Mengunci pakaian & aksesoris | Blok 2 |
| `/PROPLOCK` | Menjaga properti yang sama di setiap adegan | Blok 2 |
| `/LOCATIONLOCK` | Mengunci lokasi/setting | Blok 2 |
| `/BACKGROUNDLOCK` | Menjaga latar belakang tidak berubah | Blok 2 |
| `/LIGHTINGLOCK` | Menjaga gaya pencahayaan konsisten | Blok 2 |
| `/CAMERALOCK` | Menjaga sudut kamera dan jenis shot | Blok 5 |
| `/WEATHERLOCK` | Mengunci kondisi cuaca dan suasana | Blok 4 |
| `/VOICELOCK` | Menjaga karakter suara atau dubbing tetap sama | Blok 6 |
| `/AUDIOLOCK` | Menjaga musik, efek suara, kualitas audio konsisten | Blok 6 |
| `/STYLELOCK` | Menjaga gaya visual, warna, tone sinematik | Blok 2 |
| `/SCENECONTINUE` | Melanjutkan adegan sebelumnya dengan mulus | Blok 2 |

### 6.4 Playbook Template (6-Scene Archetypes)

Setiap kategori produk punya playbook dengan 6 scene. Contoh untuk **Skincare**:

| Scene | Archetype | Command | Tujuan Psikologis | Durasi |
|---|---|---|---|---|
| 1 | **Hook** | `/ADHOOK` + `/FACELOCK` | Pattern interrupt, curiosity gap | 8s |
| 2 | **Problem** | `/PROBLEMSOLUTION` + `/TALKINGCAM` | Relatability, "itu gue banget" | 8s |
| 3 | **Reveal** | `/PRODUCTREVEAL` + `/PRODUCTMACRO` | Dopamine hit, solusi muncul | 6s |
| 4 | **Demo/Benefit** | `/HOWTOUSE` + `/BENEFITSAD` | Proof of function, mengurangi risiko | 8s |
| 5 | **Bukti Sosial** | `/TESTIMONIALUGC` + `/RESULTSHOT` | Social proof, hilangkan keraguan | 8s |
| 6 | **CTA** | `/UGCCTA` + `/CTAEND` + `/ENDINGBRAND` | Urgensi + ajakan jelas | 6s |
| | | | **Total** | **44s** |

**Playbook yang harus tersedia di MVP:**
1. `SKINCARE_BEFORE_AFTER_v3`
2. `FASHION_TRYON_OOTD_v2`
3. `FNB_TASTY_REACTION_v2`
4. `GADGET_UNBOXING_TECH_v2`
5. `HOME_LIVING_TRANSFORM_v1`
6. `HEALTH_WELLNESS_ROUTINE_v1`
7. `UNIVERSAL_AFFILIATE_v1` (fallback)

---

## 7. Spesifikasi Fungsional

### 7.1 Fitur MVP (Must Have)

| ID | Fitur | Deskripsi | Prioritas |
|---|---|---|---|
| **F-01** | Upload Produk | Upload 1–5 gambar/video, preview, hapus, reorder. Validasi format & ukuran. | P0 |
| **F-02** | Product Analyzer | Vision AI mendeteksi kategori, warna, material, mood, audiens. | P0 |
| **F-03** | Brief Form | Form ringkas pre-filled dari analisis, user bisa override. | P0 |
| **F-04** | Playbook Selector | Auto-pilih playbook; user bisa ganti manual. | P0 |
| **F-05** | Prompt Generator 6 Scene | Generate 6 prompt lengkap 7 blok. | P0 |
| **F-06** | Narasi Indonesia | Generate VO Indonesia dengan hook psychology per scene. | P0 |
| **F-07** | On-Screen Text | Generate teks layar pendek + timing. | P0 |
| **F-08** | Continuity Lock Engine | Otomatis menyuntik continuity block konsisten ke 6 prompt. | P0 |
| **F-09** | Copy Prompt | Copy per scene + copy semua (satu klik). | P0 |
| **F-10** | Caption Generator | 3 varian hook + caption per platform. | P0 |
| **F-11** | Hashtag Generator | Set hashtag broad/niche/lokal. | P0 |
| **F-12** | Export | Download `.txt` / `.md` paket lengkap. | P0 |
| **F-13** | Regenerate Scene | Regenerate satu scene tanpa mengubah lainnya. | P1 |
| **F-14** | Library / Riwayat | Simpan project, buka kembali, duplikat. | P1 |
| **F-15** | Voice Persona Picker | Pilih gender + tone suara (ramah, tegas, antusias, lembut, misterius). | P1 |

### 7.2 Fitur Fase 2

| ID | Fitur | Deskripsi |
|---|---|---|
| F-20 | Multi-Variasi Hook | Generate 3 versi Scene 1 untuk A/B testing |
| F-21 | Prompt Bahasa Inggris Penuh | Untuk kreator yang targeting pasar internasional |
| F-22 | Preset Brand Voice | Simpan tone & style brand untuk reuse |
| F-23 | Batch Mode | Upload 10 produk → 10 paket prompt sekaligus |
| F-24 | Storyboard Visual | Konversi prompt jadi storyboard image (via image model) |
| F-25 | Integrasi CapCut | Export SRT narasi untuk subtitle otomatis |
| F-26 | Analitik Keuangan | Hitung estimasi poin Flow yang dibutuhkan |
| F-27 | Kolaborasi Tim | Share project ke anggota tim |

### 7.3 Fitur Fase 3

- Mobile app native (iOS/Android)
- Marketplace playbook (user bisa publish & jual playbook sendiri)
- Auto-upload ke TikTok/Shopee (jika API tersedia)
- Auto-generate video langsung via Gemini API (jika unit economics memungkinkan)

### 7.4 User Stories Kunci

**US-01 (Rina):**
> Sebagai affiliate pemula, saya ingin upload foto serum dan mendapatkan 6 prompt siap pakai dalam bahasa yang saya mengerti, **supaya** saya bisa bikin video tanpa harus belajar prompt engineering.

**Acceptance Criteria:**
- Given saya upload 1 foto produk, When saya klik "Generate", Then dalam < 30 detik saya melihat 6 kartu scene.
- Setiap kartu punya prompt, narasi Indonesia, teks layar, dan tombol Copy.
- Prompt menyebut karakter, wardrobe, dan lokasi yang **sama persis** di keenam scene.

**US-02 (Bagas):**
> Sebagai creator UGC, saya ingin caption dan hashtag yang selaras dengan narasi video, **supaya** hasilnya terasa satu paket — bukan tempelan.

**Acceptance Criteria:**
- Caption menggunakan angle & pain point yang sama dengan Scene 2.
- Tersedia minimal 3 varian hook caption untuk A/B test.
- Hashtag minimal 13 tag (5 broad, 5 niche, 3 lokal).

**US-03 (Dewi):**
> Sebagai admin UMKM, saya ingin mengunduh seluruh paket sebagai satu file, **supaya** saya bisa share ke tim dan arsipkan.

**Acceptance Criteria:**
- Tombol Export menghasilkan file `.txt`/`.md` berisi 6 prompt + 6 narasi + caption + hashtag.
- File terstruktur dengan heading yang jelas.

---

## 8. Spesifikasi Teknis

### 8.1 Tech Stack Rekomendasi

| Layer | Teknologi | Alasan |
|---|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui | Mobile-first, SSR cepat, DX baik |
| State | Zustand + TanStack Query | Ringan, cocok untuk wizard flow |
| Backend | Next.js API Routes / Hono | Satu codebase, deploy mudah |
| Database | PostgreSQL (Supabase) + Drizzle ORM | Relasional, RLS untuk auth |
| Storage | Supabase Storage / Cloudflare R2 | Upload gambar produk |
| Auth | Supabase Auth (Google OAuth) | Sebagian besar user punya akun Google |
| AI — Vision | Gemini Flash (vision) | Analisis produk |
| AI — Text | Gemini Flash/Pro | Generate prompt, narasi, caption |
| Prompt Engine | TypeScript template engine (bukan LLM murni) | Determinisme & konsistensi output |
| Hosting | Vercel | Deploy instan, edge functions |
| Analytics | PostHog | Funnel + event tracking |

### 8.2 Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (PWA)                            │
│  Upload → Brief Form → Hasil 6 Scene → Caption → Export         │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────▼────────────────────────────────────┐
│                      API LAYER (Next.js)                        │
│  POST /api/analyze    → Product Analyzer                        │
│  POST /api/generate   → Conductor Engine (6 scene)              │
│  POST /api/regenerate → Single scene regenerate                 │
│  POST /api/caption    → Caption + hashtag                       │
│  GET  /api/projects   → Library                                 │
└──────┬───────────────────────────────────────┬──────────────────┘
       │                                       │
┌──────▼──────────────┐              ┌─────────▼─────────────────┐
│  CONDUCTOR ENGINE   │              │      AI PROVIDER LAYER    │
│  (deterministik)    │              │  Gemini Vision (analyze)  │
│  ├ Playbook Registry│◄────────────►│  Gemini Text (narasi,     │
│  ├ Scene Templates  │              │   caption, enrichment)    │
│  ├ Continuity Mgr   │              └───────────────────────────┘
│  ├ Hook Library ID  │
│  └ Prompt Assembler │
└──────┬──────────────┘
       │
┌──────▼──────────────────────────────────────────────────────────┐
│  DATABASE                                                       │
│  users · projects · assets · prompts · captions · playbooks     │
└─────────────────────────────────────────────────────────────────┘
```

### 8.3 Conductor Engine — Desain Inti

**Filosofi:** LLM **tidak** menulis seluruh prompt dari nol. LLM hanya mengisi *slot* pada template terstruktur. Ini menjamin konsistensi dan menghindari halusinasi struktur.

```
INPUT: Brief + Analisis + Playbook
   │
   ├─► 1. CONTINUITY RESOLVER
   │      Membuat SATU objek continuity:
   │      { character, wardrobe, location, lighting, grade, voice }
   │      → disuntikkan identik ke 6 prompt
   │
   ├─► 2. SCENE ROUTER
   │      Untuk tiap scene: ambil SceneTemplate
   │      → tentukan command set + blok yang diaktifkan
   │
   ├─► 3. LLM ENRICHMENT (per scene, paralel)
   │      Isi slot kreatif: aksi spesifik, dialog ID, on-screen text,
   │      kamera move, SFX. Diberi constraint: durasi, jumlah kata
   │      dialog (≤ 22 kata untuk 8 detik), tone suara.
   │
   ├─► 4. PROMPT ASSEMBLER
   │      Gabung template statis + continuity + enrichment
   │      → output string 7 blok, tervalidasi
   │
   └─► 5. VALIDATOR
          Cek: jumlah blok lengkap? dialog dalam tanda kutip?
          durasi konsisten? continuity identik? teks layar ≤ 5 kata?
          → jika gagal, retry scene tersebut (maks 2x)
```

**Aturan penting pada LLM Enrichment:**
- Dialog untuk scene 8 detik: **maksimal 22 kata** (≈ 2,5 kata/detik untuk tempo natural)
- On-screen text: **maksimal 5 kata** per kemunculan
- Dilarang menyebut harga spesifik di dalam **prompt** (harga ada di caption) — kecuali user meminta eksplisit di Scene 6
- Klaim produk harus berasal dari brief user, **tidak boleh dikarang** (compliance)

### 8.4 Skema Data (Ringkas)

```sql
users
  id, email, name, plan, credits, created_at

projects
  id, user_id, product_name, category, platform,
  brief_json, analysis_json, playbook_id,
  continuity_json, status, created_at

scenes
  id, project_id, scene_number, archetype, commands[],
  prompt_text, narration_text, onscreen_text,
  duration_sec, sfx, camera_note, flow_settings_json

captions
  id, project_id, platform, hook_variants[],
  caption_text, hashtags[], cta_text

playbooks
  id, slug, name, category, description,
  scene_templates_json, version, is_active

prompt_versions        -- untuk audit & A/B test kualitas
  id, project_id, scene_id, version, prompt_text,
  model_used, tokens, created_at
```

### 8.5 Kontrak API

```http
POST /api/analyze
Body:    { assetIds: string[] }
200:     { productType, dominantColors[], material,
           inferredCategory, suggestedMood,
           suggestedAudience, bestPlaybook, confidence }

POST /api/generate
Body:    { projectId, brief, playbookId, durationPerScene }
200:     { continuity: {...}, scenes: [ {
             sceneNumber, archetype, commands[],
             prompt, narration, onscreenText,
             durationSec, sfx, cameraNote, flowSettings
           } ] }
Timeout: 45s (parallel per-scene generation)

POST /api/regenerate
Body:    { projectId, sceneNumber, instruction? }
200:     { scene: {...} }

POST /api/caption
Body:    { projectId, platform }
200:     { hooks: string[3], caption, hashtags[],
           cta, bestPostingTime? }
```

### 8.6 Non-Functional Requirements

| Aspek | Requirement |
|---|---|
| **Performa** | Analisis < 8s · Generate 6 scene < 30s · Regenerate 1 scene < 10s |
| **Upload** | Maks 10 MB/file, maks 5 file, format JPG/PNG/WebP/MP4 |
| **Responsif** | Mobile-first; semua fungsi penuh di layar 360px |
| **Browser** | Chrome/Safari/Edge 2 versi terakhir; Android 8+ |
| **Ketersediaan** | 99,5% uptime bulanan |
| **Keamanan** | RLS di DB, signed URL untuk asset, rate limit 20 generate/jam/user |
| **Privasi** | Asset dihapus permanen 30 hari setelah project terakhir diakses |
| **Aksesibilitas** | WCAG 2.1 AA — kontras, label form, navigasi keyboard |
| **i18n** | UI Indonesia (default) + Inggris; output prompt bilingual |
| **Biaya** | Biaya AI per generate ≤ Rp 500 (target) |

---

## 9. Desain UX & UI

### 9.1 Prinsip Desain

1. **Copy-first** — tombol Copy harus jadi elemen paling menonjol di tiap kartu.
2. **Zero jargon** — user tidak perlu tahu istilah "ingredient" atau "aspect ratio"; sediakan default yang benar.
3. **Terlihat progres** — wizard 3 langkah dengan progress bar jelas agar tidak terasa seperti black box.
4. **Mobile-native feel** — target utama HP; tombol besar, satu kolom, bottom sheet.
5. **Bisa dipercaya** — tampilkan preview "APA YANG AKAN DIKIRIM KE FLOW" sebelum generate agar user paham.

### 9.2 Struktur Halaman

| Halaman | Isi |
|---|---|
| **Landing** | Value prop, 3 langkah cara kerja, contoh hasil, CTA "Coba Gratis" |
| **Wizard Step 1** | Upload produk + Brief Form |
| **Wizard Step 2** | Loading dengan progres ("Menganalisis produk… Menyusun 6 scene…") |
| **Wizard Step 3** | Hasil: tab **Prompt Scene** & tab **Caption** |
| **Library** | Grid project, filter kategori, aksi duplikat/hapus/buka |
| **Panduan** | Panduan singkat cara pakai hasil di Google Flow (7 langkah) |
| **Pengaturan** | Voice persona default, platform default, bahasa, plan & kredit |

### 9.3 Halaman Hasil — Wireframe Kasar

```
┌────────────────────────────────────────────┐
│ ← Serum Vitamin C           [Copy Semua] ⋮ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100%  44 detik total  │
├────────────────────────────────────────────┤
│ [ Prompt Scene (6) ] [ Caption & Hashtag ] │
├────────────────────────────────────────────┤
│ ┌────────────────────────────────────────┐ │
│ │ ① HOOK · 8s           /ADHOOK /FACELOCK│ │
│ │ ────────────────────────────────────── │ │
│ │ 📋 PROMPT                  [Copy] [🔄] │ │
│ │ ┌────────────────────────────────────┐ │ │
│ │ │ [REFERENCE]                        │ │ │
│ │ │ Use the uploaded product image...  │ │ │
│ │ │ ...                                │ │ │
│ │ └────────────────────────────────────┘ │ │
│ │ ────────────────────────────────────── │ │
│ │ 🎙️ NARASI                  [Copy]     │ │
│ │ "Eh, kulit aku dulu kusam banget..."   │ │
│ │ ────────────────────────────────────── │ │
│ │ 💬 TEKS LAYAR              [Copy]     │ │
│ │ "Kulit Kusam? Coba Ini"                │ │
│ │ ────────────────────────────────────── │ │
│ │ 🔊 lo-fi soft · 🎬 slow push-in        │ │
│ └────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────┐ │
│ │ ② PROBLEM · 8s        /PROBLEMSOLUTION │ │
│  ...                                       │
├────────────────────────────────────────────┤
│  [ Copy Semua 6 Prompt ]  [ Export .txt ]  │
└────────────────────────────────────────────┘
```

### 9.4 Tombol "Copy Semua" — Format Output

```
=== FLOWAFFILIATE — PAKET PROMPT ===
Produk : Serum Vitamin C
Platform: TikTok
Total  : 6 scene · 44 detik

--- SETELAN GOOGLE FLOW ---
Model     : Gemini Omni Flash
Aspect    : 9:16
Ingredient: [upload semua foto produk + foto karakter]

=== SCENE 1/6 — HOOK (8s) ===
[prompt lengkap]
🎙️ NARASI: "..."
💬 TEKS: "..."

[... dst]

=== CAPTION & HASHTAG ===
Hook A: "..."
Caption: "..."
Hashtag: #... #...
CTA    : "..."
```

---

## 10. Risiko & Mitigasi

| # | Risiko | Dampak | Probabilitas | Mitigasi |
|---|---|---|---|---|
| R-1 | Google Flow berubah UI/model → panduan aplikasi jadi usang | Tinggi | Sedang | Panduan disimpan di CMS, bukan hardcode; versioning playbook |
| R-2 | Prompt bahasa Indonesia tidak diindahkan model dengan baik | Tinggi | Sedang | Struktur bilingual: teknis EN, dialog ID dalam tanda kutip |
| R-3 | Karakter/wajah masih berubah antar scene | Tinggi | Tinggi | Continuity Lock wajib di setiap prompt + saran upload foto karakter sebagai ingredient |
| R-4 | User tidak paham cara pakai output di Flow | Sedang | Tinggi | Halaman Panduan 7 langkah + tooltip inline di tiap tombol Copy |
| R-5 | Biaya LLM membengkak | Sedang | Sedang | Template deterministik (LLM hanya enrichment); cache; rate limit; tier pricing |
| R-6 | Klaim produk berlebihan → masalah compliance/BPOM | Tinggi | Sedang | Validator menolak klaim kesehatan absolut; disclaimer di UI; klaim hanya dari brief user |
| R-7 | Output terasa generik & sama antar user | Sedang | Sedang | Randomisasi hook library, variasi tone suara, seed berbeda per generate |
| R-8 | Kualitas video Omni Flash di bawah ekspektasi user | Sedang | Sedang | Set ekspektasi di landing; saran generate 360p dulu untuk draft, upscale setelah cocok |
| R-9 | Fitur "custom voice" Omni tidak tersedia di semua region | Sedang | Sedang | Sediakan fallback narasi teks untuk dubbing eksternal (CapCut TTS) |
| R-10 | Pesaing meniru library prompt | Rendah | Tinggi | Pertahankan keunggulan di Continuity Engine & playbook lokal yang dikurasi manual |

---

## 11. Roadmap & Milestone

| Fase | Durasi | Deliverable |
|---|---|---|
| **Discovery** | Minggu 1 | Validasi 10 affiliate, kunci 3 playbook prioritas, kumpulkan 50 contoh prompt referensi |
| **Design** | Minggu 2 | Wireframe, design system, user flow final |
| **Build Sprint 1** | Minggu 3–4 | Upload, Analyzer, Brief Form, Conductor Engine v1 (template + assembler) |
| **Build Sprint 2** | Minggu 5 | Prompt Generator 6 scene, Narasi, On-screen text, Copy, Validator |
| **Build Sprint 3** | Minggu 6 | Caption & Hashtag, Export, Library, Continuity Engine v1 |
| **Beta** | Minggu 7 | Closed beta 30 user, ukur prompt acceptance rate |
| **Iterate** | Minggu 8 | Perbaiki playbook sesuai feedback, tuning hook library |
| **Launch MVP** | Minggu 9 | Public launch, freemium (3 paket gratis/bulan) |
| **Fase 2** | Bulan 3–4 | Multi-variasi hook, batch mode, brand voice preset, storyboard visual |
| **Fase 3** | Bulan 5–6 | Mobile native, marketplace playbook, auto-generate video via API |

---

## 12. Model Monetisasi

| Tier | Harga | Kuota | Fitur |
|---|---|---|---|
| **Free** | Rp 0 | 3 paket/bulan | Semua fitur inti, watermark di export, 1 playbook |
| **Creator** | Rp 49.000/bln | 50 paket/bulan | Semua playbook, tanpa watermark, voice persona picker, library |
| **Pro** | Rp 149.000/bln | Unlimited (fair use 300) | Batch mode, multi-variasi hook, brand voice preset, export SRT, prioritas |
| **Agency** | Rp 399.000/bln | 5 seat | Kolaborasi tim, white-label export, API access |

---

## 13. Pertanyaan Terbuka

1. Apakah output prompt harus **selalu bilingual**, atau ada preset "Indonesia penuh" untuk user yang tidak nyaman dengan Inggris?
2. Berapa jumlah scene optimal? PRD ini mengasumsikan **6 scene**; perlu validasi apakah user lebih suka 4 (lebih cepat) atau 8 (lebih kaya).
3. Apakah perlu fitur **"Import hasil dari Flow"** untuk analisis & iterasi (butuh user upload video hasil)?
4. Untuk fitur suara: sebaiknya mengandalkan **custom voice Omni Flash** (yang mungkin terbatas region) atau menyediakan **script TTS terpisah** untuk CapCut?
5. Perlukah integrasi langsung ke Google Flow via Agent/API di fase berikutnya, atau cukup copy-paste selamanya?
6. Bagaimana kebijakan untuk produk terkendali (obat, suplemen klaim kesehatan)? Perlu disclaimer wajib?

---

## 14. Lampiran

### A. Glossary

| Istilah | Arti |
|---|---|
| **Google Flow** | AI creative studio Google untuk video, gambar, dan custom tools |
| **Gemini Omni Flash** | Model video multimodal yang menjalankan Flow; mendukung text-to-video, frames-to-video, ingredients-to-video, video-to-video editing |
| **Ingredient** | Elemen visual konsisten (karakter, objek, gaya) yang di-upload untuk dipakai lintas scene |
| **Frame to Video** | Mode membuat video dari gambar sebagai frame awal (dan/atau akhir) |
| **Continuity Lock** | Blok instruksi yang mengunci identitas visual agar konsisten antar scene |
| **Playbook** | Template 6 scene untuk kategori produk tertentu |
| **Conductor Engine** | Mesin prompt deterministik yang menggabungkan template + enrichment LLM |
| **Scene Archetype** | Peran naratif sebuah scene (Hook, Problem, Reveal, Demo, Social Proof, CTA) |

### B. Checklist Kualitas Prompt (untuk QA internal)

Sebuah prompt scene dinyatakan **lolos** jika:

- [ ] Memuat 7 blok wajib (Reference, Continuity, Shot, Setting, Camera, Audio, On-screen Text)
- [ ] Menyatakan "single continuous shot" / "no jump cuts"
- [ ] Durasi disebutkan dan konsisten dengan setelan Flow
- [ ] Aspect ratio disebutkan
- [ ] Dialog dalam tanda kutip, ≤ 22 kata untuk 8 detik
- [ ] Dialog disertai arahan tone, gender, tempo
- [ ] Teks layar dalam tanda kutip, ≤ 5 kata
- [ ] Blok Continuity **identik kata-per-kata** dengan scene lain
- [ ] Nama produk disebut konsisten
- [ ] Tidak ada klaim kesehatan absolut tanpa dasar dari brief
- [ ] Tidak ada harga di prompt (kecuali scene CTA dan diminta user)

### C. Referensi

- Google Flow — model & fitur yang didukung: https://support.google.com/flow/answer/16352836
- Gemini Omni Flash — dokumentasi API & panduan prompt: https://ai.google.dev/gemini-api/docs/omni
- Gemini Omni Flash — model card: https://deepmind.google/models/model-cards/gemini-omni-flash/
- Veo 3.1 Prompting Guide (Google Cloud): https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1
- 5 tips for getting started with Flow (Google Blog): https://blog.google/innovation-and-ai/products/flow-video-tips/
- New agents, mobile apps and Gemini Omni for Google Flow: https://blog.google/innovation-and-ai/models-and-research/google-labs/flow-updates/
- Gemini Omni 1.1 Flash lets you build with more control: https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-omni-1-1-flash/
- Materi referensi internal: "1000 Google Flow Cheats" — UGC & Creator Cheats, Advertisement Cheats, Continuity Cheats

---

*Dokumen ini disusun sebagai PRD kerja. Bagian §6 (Arsitektur Prompt) adalah spesifikasi inti yang paling menentukan kualitas produk dan sebaiknya ditinjau oleh orang yang sudah hands-on dengan Google Flow sebelum development dimulai.*
