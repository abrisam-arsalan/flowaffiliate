# FlowAffiliate

Aplikasi web untuk mengubah **satu foto produk** menjadi **paket konten affiliate siap posting**:

1. **6 prompt scene** siap copy-paste ke Google Flow (model **Gemini Omni Flash**)
2. **Narasi bahasa Indonesia** dengan gaya hook yang memancing penonton
3. **Teks di layar** yang pendek dan rapi
4. **Caption + hashtag** per platform (TikTok, Shopee Video, Instagram Reels, YouTube Shorts)

Implementasi dari `PRD-FlowAffiliate.md`.

---

## Cara menjalankan

**Paling cepat — buka `index.html` di browser.** Selesai.

Aplikasi ini zero-dependency dan berjalan sepenuhnya di perangkat kamu,
tanpa install, tanpa build, tanpa server.

### Lewat server lokal (opsional)

Kalau kamu lebih suka akses lewat `http://localhost:3000`, jalankan:

```bash
bun run server.ts
```

| URL | Isi |
|---|---|
| `http://localhost:3000/` | Aplikasi |
| `http://localhost:3000/demo` | Mode demo, terisi otomatis |
| `http://localhost:3000/test` | Test suite |

Server ini **menolak berkas internal** (`.env`, `.git`, log, `_*.pid`) dengan
respons 404 — `.gitignore` hanya melindungi Git, tidak memengaruhi layer HTTP.
Ini penting karena `.env` menyimpan API key.

> **Kenapa tanpa server pun bisa?** Conductor Engine di aplikasi ini memang
> deterministik — seluruh logika pembuatan prompt ada di sisi klien. Efek
> sampingnya bagus: foto produk kamu **tidak pernah dikirim ke mana pun**.

### Mode demo

Buka `index.html?demo=1` untuk memuat contoh produk (Glow Serum Vitamin C)
secara otomatis.

### Menjalankan test suite

Buka `flowaffiliate/test-suite.html` di browser. Hasil muncul di halaman,
dan ringkasannya tersedia di `window.__TEST_RESULT`.

---

## Cara pakai

| Langkah | Yang dilakukan |
|---|---|
| **1. Upload** | Tarik foto produk (maks 5 file, 10 MB/file). Isi nama produk & kategori. |
| **2. Buat** | Klik **Buat 6 Prompt Scene**. Kurang dari sedetik. |
| **3. Ambil** | Copy prompt per scene, atau **Copy Semua 6 Prompt** sekaligus. |

Sisanya: paste ke Google Flow → generate 6 klip → gabungkan → upload.

Panduan lengkap ada di tab **Panduan** di dalam aplikasi.

---

## Arsitektur

```
index.html ─── js/ui/app.js ────────── state, wizard, event, orkestrasi
               js/ui/render.js ─────── project -> HTML
                    │
                    ├─ js/core/conductor.js ── MESIN INTI (deterministik)
                    │   1. Continuity Resolver  -> 1 objek continuity utk 6 scene
                    │   2. Scene Router         -> arketipe + command + durasi
                    │   3. Enrichment           -> dialog & teks layar
                    │   4. Prompt Assembler     -> rakit 7 blok wajib
                    │   5. Validator            -> 12 pemeriksaan kualitas
                    │
                    ├─ js/core/ai.js ───────── OPSIONAL: perhalus narasi via Gemini
                    ├─ js/core/export.js ───── paket .txt / .json / SRT
                    └─ js/core/storage.js ──── Library (localStorage)

Basis data prompt:
  js/data/commands.js ──── 69 command Google Flow
  js/data/archetypes.js ── 6 arketipe scene + kandidat dialog Indonesia
  js/data/playbooks.js ─── 7 kategori produk (continuity, pain, benefit, hashtag)
  js/data/platforms.js ─── platform, voice persona, gaya visual, pacing
```

### Keputusan desain yang penting

**Conductor Engine deterministik, bukan LLM bebas.**
LLM hanya mengisi *slot* kreatif (dialog, teks layar). Struktur prompt, blok
continuity, dan aturan teknis berasal dari kode. Hasilnya konsisten, bisa
direproduksi (ada `seed`), dan tidak pernah gagal karena API mati.

**Prompt bilingual.**
Struktur sinematik (shot, camera, continuity) ditulis **Inggris** karena model
menaatinya lebih presisi. Dialog dan teks di layar tetap **Indonesia** di dalam
tanda kutip, supaya pengucapan dan render teks akurat.

**Continuity Lock disuntikkan identik ke 6 prompt.**
Ini menjawab pain point terbesar: wajah dan karakter yang berubah-ubah antar
scene. Satu objek continuity dibuat sekali, lalu dipakai kata-per-kata sama di
keenam prompt.

**Batas kata dihitung, bukan dikira-kira.**
Ucapan bahasa Indonesia tempo natural ≈ 2,5 kata/detik. Untuk klip 8 detik,
dialog dibatasi 20 kata. Validator menolak dialog yang melampaui budget —
karena model cenderung tidak mengucapkan kalimat yang tidak muat.

---

## AI Enrichment (opsional)

Secara default aplikasi berjalan **sepenuhnya offline** dan tetap menghasilkan
6 prompt lengkap.

Kalau kamu memasukkan **Google AI Studio API key** di tab **Pengaturan**,
narasi dan teks layar akan ditulis ulang oleh Gemini agar lebih natural dan
bervariasi. Key disimpan hanya di browser kamu.

Kalau request AI gagal (internet mati, key salah, kuota habis), aplikasi
otomatis kembali ke mode offline. **Aplikasi tidak pernah gagal karena AI.**

Dapatkan key gratis di `aistudio.google.com/apikey`.

---

## Cakupan implementasi PRD

| PRD | Status |
|---|---|
| F-01 Upload produk | ✅ drag-drop, validasi format & ukuran, maks 5 file |
| F-02 Product Analyzer | ✅ heuristik keyword (pengganti vision model, jalan offline) |
| F-03 Brief Form | ✅ dengan kolom opsional yang bisa dibuka |
| F-04 Playbook Selector | ✅ 7 playbook, bisa diganti manual |
| F-05 Prompt Generator 6 Scene | ✅ 7 blok wajib per scene |
| F-06 Narasi Indonesia | ✅ per scene, sesuai word budget |
| F-07 On-Screen Text | ✅ maks 5 kata, dengan timing |
| F-08 Continuity Lock Engine | ✅ identik kata-per-kata di 6 prompt |
| F-09 Copy Prompt | ✅ per blok + copy semua |
| F-10 Caption Generator | ✅ 3 varian hook, bisa dipilih |
| F-11 Hashtag Generator | ✅ broad/niche/lokal sesuai platform |
| F-12 Export | ✅ .txt, .json, SRT |
| F-13 Regenerate Scene | ✅ per scene, tanpa mengubah lainnya |
| F-14 Library | ✅ localStorage, buka/hapus |
| F-15 Voice Persona Picker | ✅ 6 persona |

**Fitur tambahan di luar PRD:** validator kualitas yang terlihat di UI (12
pemeriksaan), SRT export untuk subtitle, halaman Panduan, dan penyaring klaim
kesehatan absolut.

---

## Batasan yang diketahui

1. **Tidak memanggil Google Flow secara otomatis.** Flow belum menyediakan API
   publik untuk ini, jadi prompt memang dirancang untuk copy-paste manual —
   sesuai keputusan di PRD §3.3.
2. **Analisis produk berbasis keyword, bukan vision model.** Cukup akurat untuk
   kategori umum. Untuk produk ambigu, koreksi kategorinya manual.
3. **Gambar tidak disimpan di Library.** Hanya teks (prompt, narasi, caption).
   Ini disengaja demi privasi dan kuota localStorage.
4. **Kualitas dialog Indonesia dari Omni Flash belum diverifikasi.**
   Dokumentasi resmi Google tidak menyebut daftar bahasa yang didukung untuk
   dialog. Kalau audio dari Flow kurang memuaskan, pakai tab **Cara Pakai di
   Flow → Narasi lengkap** untuk TTS eksternal (CapCut) atau subtitle dari SRT.

---

## Riwayat pengujian

Test suite mencakup **117 pemeriksaan**, termasuk seluruh **84 kombinasi**
(7 playbook × 3 pacing × 4 platform). Semua lolos.

Yang diverifikasi: struktur 7 blok, aturan single-shot, batas kata dialog &
teks layar, konsistensi blok continuity, tidak ada placeholder bocor, durasi
valid (4/6/8/10s), determinisme seed, round-trip library, deteksi kategori,
pemilihan hook, dan penyaring klaim absolut.

Tiga bug nyata ditemukan dan diperbaiki selama pengujian:
1. Kalimat blok `[SHOT]` rusak secara gramatikal karena deskripsi talent yang
   panjang disisipkan tanpa subjek.
2. Frasa masalah diulang kata-per-kata di beberapa scene, sehingga narasi
   terdengar seperti membacakan brief.
3. "Serum Vitamin C" salah terdeteksi sebagai produk kesehatan, karena
   "vitamin" mengalahkan "serum" dalam skor pencocokan.
