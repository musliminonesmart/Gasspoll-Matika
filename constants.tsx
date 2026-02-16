
import React from 'react';
import { Grade, Difficulty, Badge, RamadanLevel } from './types';

export const THEME_DESC: Record<string, string> = {
  "Matcha Clean": "Segar, adem, bikin fokus 🍵",
  "Pink Cream": "Lembut dan ceria seperti permen 🍬",
  "Gold Elegant": "Elegan dan terasa premium ✨",
  "Purple Pop": "Fun banget! Biar semangat belajar 💜",
  "Mono Modern": "Rapi dan fokus, cocok buat Try Out 🧠",
  "Sky Candy": "Biru langit + pink manis, ceria! ☁️🍭",
  "Sunny Lemon": "Kuning cerah, mood langsung naik! 🍋☀️",
  "Mint Ocean": "Mint segar + biru laut, modern 🌊",
  "Peach Soda": "Hangat dan fun, nyaman di mata 🍑🥤",
  "Lavender Milk": "Ungu pastel yang kalem banget 🥛💜",
  "Aqua Robot": "Nuansa tech lucu, serasa robot pintar 🤖💧",
  "Forest Kids": "Hijau natural, adem & cocok Ramadan 🌿🌙",
  "Red Hero": "Mode ujian: tegas, fokus, berani ❤️🏆",
};

export const THEME_COLORS = {
  'Matcha Clean': {
    bg: 'bg-[#F7FAF7]',
    primary: 'bg-[#91C788]',
    text: 'text-[#2D4F2D]',
    accent: 'bg-[#EAF6E5]',
    button: 'bg-[#91C788] hover:bg-[#7EB675] text-white',
    card: 'bg-white border-[#D9EBD9]',
    sidebar: 'bg-[#91C788] text-white'
  },
  'Pink Cream': {
    bg: 'bg-[#FFF5F7]',
    primary: 'bg-[#F8A4B4]',
    text: 'text-[#6B3E48]',
    accent: 'bg-[#FFE4E9]',
    button: 'bg-[#F8A4B4] hover:bg-[#E28D9E] text-white',
    card: 'bg-white border-[#FAD3DB]',
    sidebar: 'bg-[#F8A4B4] text-white'
  },
  'Gold Elegant': {
    bg: 'bg-[#FAF9F6]',
    primary: 'bg-[#C5A059]',
    text: 'text-[#4A3B1F]',
    accent: 'bg-[#F3EAD3]',
    button: 'bg-[#C5A059] hover:bg-[#A88748] text-white',
    card: 'bg-white border-[#E5D4B1]',
    sidebar: 'bg-[#4A3B1F] text-[#F3EAD3]'
  },
  'Purple Pop': {
    bg: 'bg-[#F8F5FF]',
    primary: 'bg-[#9D76F2]',
    text: 'text-[#403066]',
    accent: 'bg-[#ECE5FF]',
    button: 'bg-[#9D76F2] hover:bg-[#835AD1] text-white',
    card: 'bg-white border-[#DAD0F7]',
    sidebar: 'bg-[#403066] text-white'
  },
  'Mono Modern': {
    bg: 'bg-white',
    primary: 'bg-gray-900',
    text: 'text-gray-900',
    accent: 'bg-gray-100',
    button: 'bg-gray-900 hover:bg-black text-white',
    card: 'bg-white border-gray-200',
    sidebar: 'bg-black text-white'
  },
  'Sky Candy': {
    bg: 'bg-[#F0F9FF]',
    primary: 'bg-[#38BDF8]',
    text: 'text-[#0C4A6E]',
    accent: 'bg-[#FCE7F3]',
    button: 'bg-[#38BDF8] hover:bg-[#0EA5E9] text-white',
    card: 'bg-white border-[#BAE6FD]',
    sidebar: 'bg-[#0369A1] text-white'
  },
  'Sunny Lemon': {
    bg: 'bg-[#FFFBEB]',
    primary: 'bg-[#FBBF24]',
    text: 'text-[#78350F]',
    accent: 'bg-[#FEF3C7]',
    button: 'bg-[#FBBF24] hover:bg-[#F59E0B] text-white',
    card: 'bg-white border-[#FDE68A]',
    sidebar: 'bg-[#92400E] text-white'
  },
  'Mint Ocean': {
    bg: 'bg-[#F0FDFA]',
    primary: 'bg-[#2DD4BF]',
    text: 'text-[#134E4A]',
    accent: 'bg-[#CFFAFE]',
    button: 'bg-[#2DD4BF] hover:bg-[#14B8A6] text-white',
    card: 'bg-white border-[#99F6E4]',
    sidebar: 'bg-[#0F766E] text-white'
  },
  'Peach Soda': {
    bg: 'bg-[#FFF7ED]',
    primary: 'bg-[#FB923C]',
    text: 'text-[#7C2D12]',
    accent: 'bg-[#FFEDD5]',
    button: 'bg-[#FB923C] hover:bg-[#F97316] text-white',
    card: 'bg-white border-[#FED7AA]',
    sidebar: 'bg-[#9A3412] text-white'
  },
  'Lavender Milk': {
    bg: 'bg-[#F5F3FF]',
    primary: 'bg-[#A78BFA]',
    text: 'text-[#4C1D95]',
    accent: 'bg-[#EDE9FE]',
    button: 'bg-[#A78BFA] hover:bg-[#8B5CF6] text-white',
    card: 'bg-white border-[#DDD6FE]',
    sidebar: 'bg-[#5B21B6] text-white'
  },
  'Aqua Robot': {
    bg: 'bg-[#F8FAFC]',
    primary: 'bg-[#06B6D4]',
    text: 'text-[#0F172A]',
    accent: 'bg-[#E2E8F0]',
    button: 'bg-[#06B6D4] hover:bg-[#0891B2] text-white',
    card: 'bg-white border-[#CBD5E1]',
    sidebar: 'bg-[#1E293B] text-white'
  },
  'Forest Kids': {
    bg: 'bg-[#F0FDF4]',
    primary: 'bg-[#16A34A]',
    text: 'text-[#064E3B]',
    accent: 'bg-[#FEF3C7]',
    button: 'bg-[#16A34A] hover:bg-[#15803D] text-white',
    card: 'bg-white border-[#BBF7D0]',
    sidebar: 'bg-[#064E3B] text-white'
  },
  'Red Hero': {
    bg: 'bg-[#FEF2F2]',
    primary: 'bg-[#DC2626]',
    text: 'text-[#450A0A]',
    accent: 'bg-[#F3F4F6]',
    button: 'bg-[#DC2626] hover:bg-[#B91C1C] text-white',
    card: 'bg-white border-[#FECACA]',
    sidebar: 'bg-[#7F1D1D] text-white'
  }
};

export const CURRICULUM = {
  [Grade.K4]: [
    { id: '4-1', title: 'Bilangan & Operasi', subtopics: ['Nilai Tempat', 'Pembulatan', 'Penjumlahan Bersusun', 'Operasi Campuran'] },
    { id: '4-2', title: 'FPB & KPK Dasar', subtopics: ['Faktor Bilangan', 'Kelipatan Bilangan'] },
    { id: '4-3', title: 'Pecahan Dasar', subtopics: ['Pecahan Senilai', 'Membandingkan Pecahan'] },
    { id: '4-4', title: 'Pengukuran', subtopics: ['Panjang', 'Berat', 'Waktu'] },
    { id: '4-5', title: 'Bangun Datar', subtopics: ['Keliling Persegi', 'Luas Persegi Panjang', 'Segitiga'] }
  ],
  [Grade.K5]: [
    { id: '5-1', title: 'Pecahan, Desimal, Persen', subtopics: ['Tambah Kurang Pecahan', 'Desimal', 'Persen'] },
    { id: '5-2', title: 'FPB & KPK Lanjutan', subtopics: ['Soal Cerita FPB/KPK'] },
    { id: '5-3', title: 'Bangun Datar Lanjutan', subtopics: ['Jajar Genjang', 'Trapesium'] },
    { id: '5-4', title: 'Volume', subtopics: ['Kubus', 'Balok'] },
    { id: '5-5', title: 'SJT (Kecepatan)', subtopics: ['Jarak', 'Waktu', 'Kecepatan'] }
  ],
  [Grade.K6]: [
    { id: '6-1', title: 'Pecahan & Persen Intensif', subtopics: ['Diskon', 'Kenaikan Harga'] },
    { id: '6-2', title: 'Perbandingan & Skala', subtopics: ['Skala Peta', 'Perbandingan Senilai'] },
    { id: '6-3', title: 'Bangun Datar Gabungan', subtopics: ['Lingkaran', 'Gabungan Bangun'] },
    { id: '6-4', title: 'Bangun Ruang', subtopics: ['Volume Gabungan', 'Luas Permukaan'] },
    { id: '6-5', title: 'Statistika', subtopics: ['Rata-rata (Mean)', 'Modus', 'Median'] }
  ]
};

export const FORMULAS = {
  [Grade.K4]: [
    { topic: 'Keliling Persegi', formula: 'K = 4 × s', example: 'Sisi 5 cm, maka K = 4 × 5 = 20 cm' },
    { topic: 'Luas Persegi Panjang', formula: 'L = p × l', example: 'P=10, L=5, maka L = 10 × 5 = 50' },
    { topic: 'Pecahan Senilai', formula: 'a/b = (a×k)/(b×k)', example: '1/2 = (1×2)/(2×2) = 2/4' }
  ],
  [Grade.K5]: [
    { topic: 'Persen', formula: 'x% = x/100', example: '25% = 25/100 = 1/4' },
    { topic: 'Volume Balok', formula: 'V = p × l × t', example: 'P=5, L=3, T=2, maka V = 5×3×2 = 30' },
    { topic: 'Jarak (SJT)', formula: 'S = V × t', example: 'Kecepatan 60km/jam, Waktu 2 jam, Jarak = 120km' }
  ],
  [Grade.K6]: [
    { topic: 'Diskon', formula: 'Harga Akhir = Harga Awal - (Diskon% × Harga Awal)', example: 'Baju 100rb diskon 10% jadi 90rb' },
    { topic: 'Skala', formula: 'Skala = Jarak Peta / Jarak Sebenarnya', example: '1 cm di peta mewakili 1 km (1:100.000)' },
    { topic: 'Rata-rata', formula: 'Mean = Jumlah Data / Banyak Data', example: 'Nilai 8, 9, 7 -> Rata-rata = (8+9+7)/3 = 8' }
  ]
};

export const RAMADAN_WAJIB_BASE = [
  { "title": "Sahur (niat & makan cukup)", "note": "minum air ya" },
  { "title": "Sholat Subuh", "note": "" },
  { "title": "Dzikir / Doa pagi (3–5 menit)", "note": "pelan saja" },
  { "title": "Sholat Dzuhur", "note": "" },
  { "title": "Sholat Ashar", "note": "" },
  { "title": "Baca Al-Qur’an 10 menit", "note": "1–2 halaman boleh" },
  { "title": "Sholat Maghrib", "note": "" },
  { "title": "Sholat Isya", "note": "" },
  { "title": "Tarawih (semampunya)", "note": "di rumah/masjid" },
  { "title": "Kebaikan kecil hari ini", "note": "senyum, bantu, sopan" }
];

export const RAMADAN_DAILY_TARGETS: Record<string, string[]> = {
  "1": ["Tulis 3 hal yang kamu syukuri hari ini", "Bantu orang tua 1 tugas kecil", "Latihan Matika (auto by kelas)", "Baca kisah nabi 5 menit"],
  "2": ["Hafal 1 doa pendek", "Rapikan meja belajar", "Latihan Matika (auto by kelas)", "Tidak marah hari ini (latihan sabar)"],
  "3": ["Sedekah: uang/barang/kebaikan", "Baca buku 10 menit", "Latihan Matika (auto by kelas)", "Tidur lebih awal (sebelum 22.00)"],
  "4": ["Latihan menulis rapi 5 menit", "Bantu adik/kakak belajar 5 menit", "Latihan Matika (auto by kelas)", "Jalan santai 10 menit (sehat)"],
  "5": ["Hafal 1 ayat pendek", "Jaga lisan (tidak berkata kasar)", "Latihan Matika (auto by kelas)", "Siapkan baju/alat sekolah besok"],
  "6": ["Bersihkan kamar 10 menit", "Baca Al-Qur’an +5 menit (bonus)", "Latihan Matika (auto by kelas)", "Tolong tetangga/teman (kebaikan)"],
  "7": ["Catat 1 rumus praktis hari ini", "Latihan Matika (auto by kelas)", "Review 1 kesalahan (kelas 6 wajib)", "Tulis 1 target besok"],
  "8": ["Hafal 1 hadits pendek (atau 1 pesan baik)", "Bantu siapkan berbuka", "Latihan Matika (auto by kelas)", "No gadget 30 menit (tantangan)"],
  "9": ["Baca buku cerita islami 10 menit", "Rapikan tas sekolah", "Latihan Matika (auto by kelas)", "Minum air cukup saat berbuka"],
  "10": ["Tulis surat kecil untuk orang tua (terima kasih)", "Latihan Matika (auto by kelas)", "Latihan fokus 10 menit (tanpa distraksi)", "Senyum & salam lebih sering"],
  "11": ["Hafal 1 doa berbuka/puasa", "Bantu cuci piring 5 menit", "Latihan Matika (auto by kelas)", "Olahraga ringan 10 menit"],
  "12": ["Baca Al-Qur’an +5 menit (bonus)", "Tidak mengeluh hari ini (tantangan)", "Latihan Matika (auto by kelas)", "Tulis 1 hal baik yang kamu lakukan"],
  "13": ["Hafal 1 ayat pendek", "Bantu beres-beres rumah 10 menit", "Latihan Matika (auto by kelas)", "Siapkan jadwal belajar besok"],
  "14": ["Catat 1 materi yang masih bingung", "Latihan Matika (auto by kelas)", "Tanya Kak Chat Matika 1 pertanyaan", "Tidur lebih awal"],
  "15": ["Sedekah / berbagi makanan", "Baca kisah sahabat nabi 5 menit", "Latihan Matika (auto by kelas)", "Jaga emosi (tarik napas 3x kalau kesal)"],
  "16": ["Bantu adik/kakak 1 hal", "Rapikan lemari/buku 10 menit", "Latihan Matika (auto by kelas)", "No gadget 30 menit"],
  "17": ["Catat 1 rumus praktis baru", "Latihan Matika (auto by kelas)", "Review 1 soal salah (kelas 5–6)", "Tulis 1 target minggu ini"],
  "18": ["Hafal 1 doa pendek", "Bantu siapkan sahur", "Latihan Matika (auto by kelas)", "Baca buku 10 menit"],
  "19": ["Baca Al-Qur’an +5 menit (bonus)", "Tidak berkata kasar (tantangan)", "Latihan Matika (auto by kelas)", "Minum air cukup saat berbuka"],
  "20": ["Tulis 3 hal yang kamu syukuri", "Bersihkan meja belajar", "Latihan Matika (auto by kelas)", "Olahraga ringan 10 menit"],
  "21": ["Hafal 1 ayat pendek", "Bantu orang tua 1 tugas", "Latihan Matika (auto by kelas)", "Tulis 1 pelajaran hari ini"],
  "22": ["Sedekah (apa saja)", "Baca kisah nabi 5 menit", "Latihan Matika (auto by kelas)", "No gadget 30 menit"],
  "23": ["Catat 1 materi yang mau diulang", "Latihan Matika (auto by kelas)", "Tanya Kak Chat Matika 1 hal", "Tidur lebih awal"],
  "24": ["Bantu siapkan berbuka", "Baca Al-Qur’an +5 menit (bonus)", "Latihan Matika (auto by kelas)", "Jaga sabar (tidak marah)"],
  "25": ["Hafal 1 doa pendek", "Bersihkan kamar 10 menit", "Latihan Matika (auto by kelas)", "Baca buku 10 menit"],
  "26": ["Catat 1 rumus praktis favorit", "Latihan Matika (auto by kelas)", "Review 1 soal salah (kelas 5–6)", "Tulis target besok"],
  "27": ["Sedekah / berbagi kebaikan", "Bantu orang tua 1 tugas", "Latihan Matika (auto by kelas)", "No gadget 30 menit"],
  "28": ["Baca Al-Qur’an +5 menit (bonus)", "Tulis 3 hal syukur", "Latihan Matika (auto by kelas)", "Olahraga ringan 10 menit"],
  "29": ["Hafal 1 ayat/doa pendek", "Rapikan tas/buku sekolah", "Latihan Matika (auto by kelas)", "Siapkan rencana setelah Ramadan"],
  "30": ["Tulis pencapaian Ramadan (3 hal)", "Minta maaf & maafkan orang lain", "Latihan Matika (auto by kelas)", "Rayakan dengan bersyukur 😊"]
};

export const getMathTarget = (grade: Grade) => {
  if (grade === Grade.K4) return "Latihan Matika: 5 soal PG";
  if (grade === Grade.K5) return "Latihan Matika: 10 soal PG";
  return "Latihan Matika: 15 soal PG + bahas 1 soal salah";
};

export const RAMADAN_BADGES: Badge[] = [
  { id: 'streak_3', title: 'Pejuang Konsisten', icon: '🏅', desc: '3 hari berturut-turut WAJIB rapi!' },
  { id: 'streak_7', title: 'Super Semangat', icon: '🔥', desc: '7 hari berturut-turut WAJIB rapi!' },
  { id: 'streak_15', title: 'Calon Juara', icon: '🌙', desc: '15 hari berturut-turut WAJIB rapi!' },
  { id: 'streak_30', title: 'Master Ramadan', icon: '👑', desc: '30 hari penuh perjuangan hebat!' },
  { id: 'quran_20', title: 'Sahabat Qur’an', icon: '📖', desc: 'Baca Al-Qur’an minimal 20 hari.' },
  { id: 'helper_15', title: 'Anak Penolong', icon: '🤝', desc: 'Bantu orang tua minimal 15 hari.' },
  { id: 'math_20', title: 'Pejuang Matika', icon: '🧮', desc: 'Latihan Matematika minimal 20 hari.' },
  { id: 'wajib_10', title: 'Disiplin Hebat', icon: '⭐', desc: 'WAJIB 100% selesai selama 10 hari.' },
];

export const RAMADAN_LEVELS: RamadanLevel[] = [
  { id: 1, name: 'Pemula Kebaikan', minPoints: 0, maxPoints: 300 },
  { id: 2, name: 'Pejuang Kebaikan', minPoints: 301, maxPoints: 700 },
  { id: 3, name: 'Hebat Sekali', minPoints: 701, maxPoints: 1200 },
  { id: 4, name: 'Juara Ramadan', minPoints: 1201, maxPoints: 2000 },
  { id: 5, name: 'Master Ramadan', minPoints: 2001, maxPoints: null },
];

export const getLevelByPoints = (points: number): RamadanLevel => {
  return RAMADAN_LEVELS.find(l => points >= l.minPoints && (l.maxPoints === null || points <= l.maxPoints)) || RAMADAN_LEVELS[0];
};

export const getMotivationalMessage = (grade: Grade) => {
  if (grade === Grade.K4) return "Hebat! Kamu rajin dan berani mencoba 🌟";
  if (grade === Grade.K5) return "Keren! Kamu makin disiplin, lanjutkan ya 🔥";
  return "Luar biasa! Kamu makin siap dan percaya diri 💪";
};

// Added for TKA Analysis support in TkaAnalysisView.tsx
export const TKA_ANSWER_KEY: Record<number, string> = {
  1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'A', 6: 'B', 7: 'C', 8: 'D', 9: 'A', 10: 'B',
  11: 'A', 12: 'B', 13: 'C', 14: 'D', 15: 'A', 16: 'B', 17: 'C', 18: 'D', 19: 'A', 20: 'B',
  21: 'A', 22: 'B', 23: 'C', 24: 'D', 25: 'A', 26: 'B', 27: 'C', 28: 'D', 29: 'A', 30: 'B',
  31: 'A', 32: 'B', 33: 'C', 34: 'D', 35: 'A', 36: 'B', 37: 'C', 38: 'D', 39: 'A', 40: 'B'
};

const TKA_TOPIC_LIST = ['Bilangan', 'Geometri', 'Statistika', 'Pecahan', 'Perbandingan'];
// Fixed TKA_QUESTION_META type error by using an explicit generic in reduce and typing the accumulator
export const TKA_QUESTION_META: Record<number, { topic: string; sub: string }> = Array.from({ length: 40 }).reduce<Record<number, { topic: string; sub: string }>>((acc, _, i) => {
  const n = i + 1;
  acc[n] = { 
    topic: TKA_TOPIC_LIST[i % TKA_TOPIC_LIST.length], 
    sub: `Pembahasan Materi Soal Nomor ${n}` 
  };
  return acc;
}, {} as Record<number, { topic: string; sub: string }>);

// LICENSE CONFIGURATION
export const LICENSE_CONFIG = {
  enabled: true,
  prefix: "GPM",             // prefix kode
  deviceLock: true,          // ikat ke device
  codeMinLength: 10,
  maxAttempts: 5,
  lockSeconds: 60,
  // Jika kamu mau masa aktif:
  expiryDays: 0,             // 0 = seumur hidup
};

export const DEVICE_KEY = "gpm_device_id_v1";

export function getOrCreateDeviceId() {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = crypto?.randomUUID ? crypto.randomUUID() : `dev_${Date.now()}_${Math.random()}`;
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    // fallback kalau storage diblok
    return `dev_${Date.now()}_${Math.random()}`;
  }
}

export const SUPER_ADMIN = {
  email: "Musliminonesmart@gmail.com",
  waNumber: "6289670335578", // format internasional tanpa 0
  waDisplay: "089670335578",
  adminPinDefault: "2580",
  // opsi: sembunyikan menu admin di UI
  hideAdminMenu: true,
};
