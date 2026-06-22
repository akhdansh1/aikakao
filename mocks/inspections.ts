import { dateOffsetFromNow, formatRelativeTimestamp } from "@/utils/time";

export type SeverityLevel = "tinggi" | "sedang" | "rendah" | null;
export type StatusLevel = "kritis" | "sedang" | "sehat";
export type OrganType = "batang" | "daun" | "buah";

export interface Inspection {
  id: string;
  blockId: string; // contoh: BLK-A7-042
  disease: string | null; // null jika sehat
  scientificName: string | null;
  confidence: number; // 0-100
  organ: OrganType;
  status: StatusLevel;
  severity: SeverityLevel;
  recommendation: string[];
  timestamp: string; // label tampilan, dihitung relatif ke waktu sekarang
  date: string; // ISO string asli, dipakai untuk sorting & filter "hari ini"
  latitude: number;
  longitude: number;
  block: "A" | "B" | "C" | "D";
  synced: boolean;
  photoUri?: string; // URI foto lokal hasil kamera (file://...), kosong untuk data mock/seed
}

/**
 * Definisi mentah memakai offset waktu (mis. "25 menit lalu") bukan
 * tanggal absolut, supaya data demo selalu terasa baru kapan pun
 * aplikasi dibuka/di-build ulang — bukan terjebak di satu tanggal
 * yang akhirnya terasa kedaluwarsa ("kemarin" yang sebenarnya sudah
 * berbulan-bulan lalu).
 */
interface RawInspectionSeed {
  id: string;
  blockId: string;
  disease: string | null;
  scientificName: string | null;
  confidence: number;
  organ: OrganType;
  status: StatusLevel;
  severity: SeverityLevel;
  recommendation: string[];
  offset: { minutesAgo?: number; hoursAgo?: number; daysAgo?: number };
  latitude: number;
  longitude: number;
  block: "A" | "B" | "C" | "D";
  synced: boolean;
}

const RAW_SEEDS: RawInspectionSeed[] = [
  {
    id: "insp-001",
    blockId: "BLK-A7-042",
    disease: "Black Pod",
    scientificName: "Phytophthora palmivora",
    confidence: 94.7,
    organ: "buah",
    status: "kritis",
    severity: "tinggi",
    recommendation: [
      "Buang buah terinfeksi segera",
      "Semprotkan fungisida berbasis tembaga",
      "Eskalasi ke agronomis",
    ],
    offset: { minutesAgo: 12 },
    latitude: -2.1547,
    longitude: 117.3821,
    block: "A",
    synced: true,
  },
  {
    id: "insp-002",
    blockId: "BLK-A7-041",
    disease: null,
    scientificName: null,
    confidence: 98.2,
    organ: "daun",
    status: "sehat",
    severity: null,
    recommendation: ["Tidak ada tindakan diperlukan", "Lanjutkan monitoring berkala"],
    offset: { minutesAgo: 24 },
    latitude: -2.1551,
    longitude: 117.3818,
    block: "A",
    synced: true,
  },
  {
    id: "insp-003",
    blockId: "BLK-A5-018",
    disease: null,
    scientificName: null,
    confidence: 97.1,
    organ: "batang",
    status: "sehat",
    severity: null,
    recommendation: ["Tidak ada tindakan diperlukan", "Lanjutkan monitoring berkala"],
    offset: { hoursAgo: 1 },
    latitude: -2.1562,
    longitude: 117.3805,
    block: "A",
    synced: true,
  },
  {
    id: "insp-004",
    blockId: "BLK-A5-003",
    disease: "VSD",
    scientificName: "Oncobasidium theobromae",
    confidence: 71.3,
    organ: "daun",
    status: "sedang",
    severity: "sedang",
    recommendation: [
      "Pangkas cabang yang menunjukkan gejala",
      "Aplikasikan fungisida sistemik",
      "Monitoring ulang dalam 7 hari",
    ],
    offset: { hoursAgo: 1, minutesAgo: 33 },
    latitude: -2.1568,
    longitude: 117.3812,
    block: "A",
    synced: true,
  },
  {
    id: "insp-005",
    blockId: "BLK-B2-007",
    disease: null,
    scientificName: null,
    confidence: 96.5,
    organ: "buah",
    status: "sehat",
    severity: null,
    recommendation: ["Tidak ada tindakan diperlukan", "Lanjutkan monitoring berkala"],
    offset: { daysAgo: 1, hoursAgo: 5 },
    latitude: -2.1538,
    longitude: 117.3842,
    block: "B",
    synced: true,
  },
  {
    id: "insp-006",
    blockId: "BLK-D1-011",
    disease: "CSSVD",
    scientificName: "Cacao Swollen Shoot Virus",
    confidence: 88.1,
    organ: "batang",
    status: "kritis",
    severity: "tinggi",
    recommendation: [
      "Isolasi pohon terinfeksi segera",
      "Laporkan ke agronomis untuk eradikasi",
      "Periksa pohon di radius 10 meter",
    ],
    offset: { daysAgo: 1, hoursAgo: 7 },
    latitude: -2.1601,
    longitude: 117.3795,
    block: "D",
    synced: true,
  },
  {
    id: "insp-007",
    blockId: "BLK-B3-014",
    disease: "VSD",
    scientificName: "Oncobasidium theobromae",
    confidence: 76.4,
    organ: "daun",
    status: "sedang",
    severity: "sedang",
    recommendation: [
      "Pangkas cabang yang menunjukkan gejala",
      "Aplikasikan fungisida sistemik",
      "Monitoring ulang dalam 7 hari",
    ],
    offset: { daysAgo: 1, hoursAgo: 10 },
    latitude: -2.1531,
    longitude: 117.3848,
    block: "B",
    synced: false,
  },
  {
    id: "insp-008",
    blockId: "BLK-C1-022",
    disease: null,
    scientificName: null,
    confidence: 95.8,
    organ: "batang",
    status: "sehat",
    severity: null,
    recommendation: ["Tidak ada tindakan diperlukan", "Lanjutkan monitoring berkala"],
    offset: { daysAgo: 2, hoursAgo: 2 },
    latitude: -2.1575,
    longitude: 117.3788,
    block: "C",
    synced: true,
  },
];

/**
 * Generate ulang daftar inspeksi dengan timestamp relatif terhadap
 * waktu saat ini. Dipanggil sekali saat modul ini di-import (artinya
 * setiap kali app dibuka/restart, "12 menit lalu" dkk. dihitung
 * ulang dari Date.now() yang sesungguhnya).
 */
function buildMockInspections(): Inspection[] {
  return RAW_SEEDS.map((seed) => {
    const date = dateOffsetFromNow(seed.offset);
    return {
      id: seed.id,
      blockId: seed.blockId,
      disease: seed.disease,
      scientificName: seed.scientificName,
      confidence: seed.confidence,
      organ: seed.organ,
      status: seed.status,
      severity: seed.severity,
      recommendation: seed.recommendation,
      timestamp: formatRelativeTimestamp(date),
      date: date.toISOString(),
      latitude: seed.latitude,
      longitude: seed.longitude,
      block: seed.block,
      synced: seed.synced,
    };
  });
}

export const MOCK_INSPECTIONS: Inspection[] = buildMockInspections();

export const DASHBOARD_STATS = {
  scanHariIni: 7,
  terinfeksiKritis: 5,
  keparahanSedang: 4,
  tanamanSehat: 58,
  totalTanaman: 67,
  trendScan: { value: 2, direction: "up" as const },
  trendKritis: { value: 1, direction: "up" as const },
  trendSedang: { value: 1, direction: "down" as const },
  trendSehat: { value: 3, direction: "up" as const },
};

export const DISEASE_OPTIONS = [
  { name: "Black Pod", scientificName: "Phytophthora palmivora", organ: "buah" as OrganType },
  { name: "VSD", scientificName: "Oncobasidium theobromae", organ: "daun" as OrganType },
  { name: "CSSVD", scientificName: "Cacao Swollen Shoot Virus", organ: "batang" as OrganType },
];
