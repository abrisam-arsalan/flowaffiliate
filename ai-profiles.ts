/**
 * FlowAffiliate — Penyimpanan profil AI.
 *
 * Menyimpan beberapa konfigurasi API (base URL, key, model) di berkas
 * `_ai-profiles.json` di root repo, sehingga bisa diatur langsung dari
 * halaman Pengaturan tanpa mengedit `.env` dan tanpa menjalankan ulang server.
 *
 * KENAPA DI SERVER, BUKAN DI BROWSER:
 *   Kalau key disimpan di localStorage, ia harus dikirim ulang pada setiap
 *   permintaan dan bisa dicuri lewat XSS. Dengan disimpan di sini, key hanya
 *   melintas sekali (saat Anda klik Simpan) lalu tetap di mesin ini.
 *
 * Nama berkas sengaja diawali garis bawah. Server statis sudah menolak semua
 * path yang segmennya berawalan `_`, jadi berkas ini otomatis TIDAK bisa
 * diunduh lewat HTTP — penyimpanan dan perlindungannya jadi satu hal yang sama.
 *
 * Urutan prioritas konfigurasi:
 *   1. Profil aktif (diatur dari UI)
 *   2. Nilai di `.env` (cadangan, berguna untuk deployment)
 *   3. Tidak ada -> analisis AI dimatikan
 */

import { join } from "node:path";
import { readFileSync, writeFileSync, renameSync } from "node:fs";

const ROOT = import.meta.dir;
const STORE = join(ROOT, "_ai-profiles.json");

export type Profile = {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  visionModel: string;
  textModel: string;
  visionModels: string[];
  timeoutMs: number;
  createdAt: string;
  lastTestAt?: string;
  lastTestOk?: boolean;
  lastTestMsg?: string;
};

export type EffectiveConfig = {
  baseUrl: string;
  apiKey: string;
  visionModel: string;
  textModel: string;
  visionModels: string[];
  timeoutMs: number;
  source: "profile" | "env" | "none";
  profileId?: string;
  profileName?: string;
};

type State = { version: number; activeId: string | null; profiles: Profile[] };

const EMPTY: State = { version: 1, activeId: null, profiles: [] };

/* ══════════════════════════ Baca / tulis ══════════════════════════════ */

function load(): State {
  try {
    const raw = JSON.parse(readFileSync(STORE, "utf8"));
    if (!raw || typeof raw !== "object" || !Array.isArray(raw.profiles)) {
      return { ...EMPTY, profiles: [] };
    }
    return {
      version: raw.version ?? 1,
      activeId: typeof raw.activeId === "string" ? raw.activeId : null,
      profiles: raw.profiles.filter(
        (p: unknown): p is Profile =>
          !!p && typeof p === "object" && typeof (p as Profile).id === "string",
      ),
    };
  } catch {
    // Berkas rusak atau belum ada: mulai bersih daripada gagal total.
    return { ...EMPTY, profiles: [] };
  }
}

function save(state: State): void {
  // Tulis ke berkas sementara lalu ganti, supaya berkas asli tidak pernah
  // setengah tertulis bila proses berhenti di tengah.
  const tmp = STORE + ".tmp";
  writeFileSync(tmp, JSON.stringify(state, null, 2), "utf8");
  renameSync(tmp, STORE);
}

/* ══════════════════════════ Utilitas ══════════════════════════════════ */

export function newId(): string {
  return "prof_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
}

/** Samarkan key agar bisa ditampilkan di UI tanpa membocorkan isinya. */
export function maskKey(key: string): string {
  if (!key) return "";
  if (key.length <= 8) return "••••••";
  return key.slice(0, 3) + "••••••" + key.slice(-4);
}

/** Rapikan base URL: buang spasi dan garis miring di akhir. */
export function normalizeBaseUrl(url: string): string {
  return String(url || "").trim().replace(/\/+$/, "");
}

export function validateProfileInput(input: any): { ok: true; value: Partial<Profile> } | { ok: false; error: string } {
  if (!input || typeof input !== "object") return { ok: false, error: "Data profil tidak valid." };

  const name = String(input.name ?? "").trim();
  if (!name) return { ok: false, error: "Nama profil wajib diisi." };
  if (name.length > 60) return { ok: false, error: "Nama profil maksimal 60 karakter." };

  const baseUrl = normalizeBaseUrl(input.baseUrl);
  if (!baseUrl) return { ok: false, error: "Base URL wajib diisi." };
  if (!/^https?:\/\//i.test(baseUrl)) {
    return { ok: false, error: "Base URL harus diawali http:// atau https://" };
  }
  try {
    new URL(baseUrl);
  } catch {
    return { ok: false, error: "Base URL tidak bisa dibaca sebagai URL." };
  }

  const visionModel = String(input.visionModel ?? "").trim();
  const textModel = String(input.textModel ?? "").trim();

  // Daftar model boleh kosong; kalau kosong, hanya model default yang dipakai.
  const visionModels: string[] = Array.isArray(input.visionModels)
    ? input.visionModels.map((s: unknown) => String(s).trim()).filter(Boolean).slice(0, 30)
    : [];

  if (visionModel && visionModels.length && !visionModels.includes(visionModel)) {
    // Model default wajib ada di allowlist, kalau tidak pemilih model akan
    // menampilkan daftar yang tidak memuat nilai terpilih.
    visionModels.unshift(visionModel);
  }

  let timeoutMs = Number(input.timeoutMs);
  if (!isFinite(timeoutMs) || timeoutMs < 3000) timeoutMs = 60000;
  if (timeoutMs > 300000) timeoutMs = 300000;

  return {
    ok: true,
    value: {
      name,
      baseUrl,
      visionModel,
      textModel,
      visionModels,
      timeoutMs,
      // apiKey ditangani terpisah: kosong berarti "pertahankan yang lama".
    },
  };
}

/* ══════════════════════════ Operasi publik ════════════════════════════ */

/** Daftar profil dengan key disamarkan — ini yang dikirim ke browser. */
export function listProfiles(): { profiles: any[]; activeId: string | null } {
  const s = load();
  return {
    activeId: s.activeId,
    profiles: s.profiles.map((p) => ({
      id: p.id,
      name: p.name,
      baseUrl: p.baseUrl,
      apiKeyMasked: maskKey(p.apiKey),
      hasKey: !!p.apiKey,
      visionModel: p.visionModel,
      textModel: p.textModel,
      visionModels: p.visionModels,
      timeoutMs: p.timeoutMs,
      createdAt: p.createdAt,
      lastTestAt: p.lastTestAt ?? null,
      lastTestOk: p.lastTestOk ?? null,
      lastTestMsg: p.lastTestMsg ?? null,
    })),
  };
}

/** Profil lengkap TERMASUK key — hanya untuk pemakaian internal server. */
export function getProfile(id: string): Profile | null {
  return load().profiles.find((p) => p.id === id) ?? null;
}

export function upsertProfile(input: any): { ok: true; profile: any } | { ok: false; error: string } {
  const v = validateProfileInput(input);
  if (!v.ok) return v;

  const s = load();
  const existingId = typeof input.id === "string" ? input.id : "";
  const existing = s.profiles.find((p) => p.id === existingId);

  // Key kosong saat mengedit berarti "jangan ubah key yang tersimpan" —
  // supaya UI tidak perlu mengirim ulang key hanya untuk mengganti nama.
  const incomingKey = typeof input.apiKey === "string" ? input.apiKey.trim() : "";
  const apiKey = incomingKey || (existing ? existing.apiKey : "");

  if (!apiKey) return { ok: false, error: "API key wajib diisi untuk profil baru." };

  const profile: Profile = {
    id: existing ? existing.id : newId(),
    name: v.value.name!,
    baseUrl: v.value.baseUrl!,
    apiKey,
    visionModel: v.value.visionModel || "glm-5.3-flash",
    textModel: v.value.textModel || "gpt-5.6-luna",
    visionModels: v.value.visionModels || [],
    timeoutMs: v.value.timeoutMs!,
    createdAt: existing ? existing.createdAt : new Date().toISOString(),
    lastTestAt: existing?.lastTestAt,
    lastTestOk: existing?.lastTestOk,
    lastTestMsg: existing?.lastTestMsg,
  };

  if (!profile.visionModels.length) profile.visionModels = [profile.visionModel];

  if (existing) {
    s.profiles = s.profiles.map((p) => (p.id === profile.id ? profile : p));
  } else {
    s.profiles.push(profile);
    // Profil pertama otomatis aktif supaya bisa langsung dipakai.
    if (!s.activeId) s.activeId = profile.id;
  }

  save(s);
  return { ok: true, profile: { ...profile, apiKey: undefined, apiKeyMasked: maskKey(apiKey) } };
}

export function removeProfile(id: string): boolean {
  const s = load();
  const before = s.profiles.length;
  s.profiles = s.profiles.filter((p) => p.id !== id);
  if (s.profiles.length === before) return false;
  // Kalau yang dihapus sedang aktif, jatuh ke profil pertama yang tersisa
  // (atau ke .env bila sudah tidak ada profil sama sekali).
  if (s.activeId === id) s.activeId = s.profiles.length ? s.profiles[0].id : null;
  save(s);
  return true;
}

export function setActive(id: string | null): boolean {
  const s = load();
  if (id === null) {
    s.activeId = null;
    save(s);
    return true;
  }
  if (!s.profiles.some((p) => p.id === id)) return false;
  s.activeId = id;
  save(s);
  return true;
}

export function recordTest(id: string, ok: boolean, msg: string): void {
  const s = load();
  const p = s.profiles.find((x) => x.id === id);
  if (!p) return;
  p.lastTestAt = new Date().toISOString();
  p.lastTestOk = ok;
  p.lastTestMsg = String(msg || "").slice(0, 300);
  save(s);
}

/* ══════════════════════ Resolusi konfigurasi aktif ════════════════════ */

/**
 * Tentukan konfigurasi AI yang dipakai SEKARANG.
 *
 * Dibaca ulang setiap permintaan — bukan disimpan saat server menyala —
 * sehingga menyimpan profil di UI langsung berlaku tanpa restart.
 */
export function resolveConfig(): EffectiveConfig {
  const s = load();
  const active = s.activeId ? s.profiles.find((p) => p.id === s.activeId) : null;

  if (active && active.apiKey && active.baseUrl) {
    return {
      baseUrl: active.baseUrl,
      apiKey: active.apiKey,
      visionModel: active.visionModel,
      textModel: active.textModel,
      visionModels: active.visionModels.length ? active.visionModels : [active.visionModel],
      timeoutMs: active.timeoutMs,
      source: "profile",
      profileId: active.id,
      profileName: active.name,
    };
  }

  const envUrl = normalizeBaseUrl(process.env.AI_BASE_URL ?? "");
  const envKey = process.env.AI_API_KEY ?? "";

  if (envUrl && envKey) {
    const vm = process.env.AI_VISION_MODEL ?? "glm-5.3-flash";
    const fromEnv = (process.env.AI_VISION_MODELS ?? "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    return {
      baseUrl: envUrl,
      apiKey: envKey,
      visionModel: vm,
      textModel: process.env.AI_TEXT_MODEL ?? "gpt-5.6-luna",
      visionModels: fromEnv.length ? fromEnv : [vm],
      timeoutMs: Number(process.env.AI_TIMEOUT_MS ?? 60000),
      source: "env",
    };
  }

  return {
    baseUrl: "",
    apiKey: "",
    visionModel: process.env.AI_VISION_MODEL ?? "glm-5.3-flash",
    textModel: process.env.AI_TEXT_MODEL ?? "gpt-5.6-luna",
    visionModels: [],
    timeoutMs: 60000,
    source: "none",
  };
}

export function isMock(): boolean {
  return process.env.AI_MOCK === "1";
}

export function storePath(): string {
  return STORE;
}

/** Saran model Vision dari daftar model pengguna — dipakai sebagai nilai awal. */
export const SUGGESTED_VISION_MODELS = [
  "glm-5.3-flash",
  "kimi-k3",
  "mimo-v2.6-pro",
  "glm-5.3-flashx",
  "deepseek-v4-flash-vision-exp",
  "deepseek-v4.1-flash",
  "gpt-5.6",
  "gpt-5.6-luna",
];
