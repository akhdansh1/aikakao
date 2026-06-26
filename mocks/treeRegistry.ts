/**
 * Registry pohon kakao — data hardcoded sementara.
 * Setiap pohon memiliki kode unik, posisi grid (untuk peta sketsa),
 * dan status yang dikaitkan ke data inspeksi yang sudah ada.
 *
 * Format kode: BLK-{Blok}{Baris}-{Nomor}
 * Contoh: BLK-A7-042 = Blok A, Baris 7, Pohon ke-42
 */

export type TreeStatus = "kritis" | "sedang" | "sehat" | "belum-diperiksa";

export interface TreeEntry {
  treeCode: string;
  block: "A" | "B" | "C" | "D";
  row: number;
  number: number;
  /** Posisi grid di dalam bloknya (col 0-based, row 0-based) */
  gridCol: number;
  gridRow: number;
  status: TreeStatus;
  lastInspectionDate: string | null;
  disease: string | null;
}

// ----- Blok A: 4 baris × 4 kolom = 16 pohon -----
const BLOCK_A: TreeEntry[] = [
  { treeCode: "BLK-A5-003", block: "A", row: 5, number: 3, gridCol: 0, gridRow: 0, status: "sedang", lastInspectionDate: new Date(Date.now() - 93 * 60000).toISOString(), disease: "VSD" },
  { treeCode: "BLK-A5-008", block: "A", row: 5, number: 8, gridCol: 1, gridRow: 0, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-A5-012", block: "A", row: 5, number: 12, gridCol: 2, gridRow: 0, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-A5-018", block: "A", row: 5, number: 18, gridCol: 3, gridRow: 0, status: "sehat", lastInspectionDate: new Date(Date.now() - 60 * 60000).toISOString(), disease: null },
  { treeCode: "BLK-A6-005", block: "A", row: 6, number: 5, gridCol: 0, gridRow: 1, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-A6-011", block: "A", row: 6, number: 11, gridCol: 1, gridRow: 1, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-A6-019", block: "A", row: 6, number: 19, gridCol: 2, gridRow: 1, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-A6-024", block: "A", row: 6, number: 24, gridCol: 3, gridRow: 1, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-A7-031", block: "A", row: 7, number: 31, gridCol: 0, gridRow: 2, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-A7-035", block: "A", row: 7, number: 35, gridCol: 1, gridRow: 2, status: "kritis", lastInspectionDate: new Date(Date.now() - 30 * 60000).toISOString(), disease: "Black Pod" },
  { treeCode: "BLK-A7-041", block: "A", row: 7, number: 41, gridCol: 2, gridRow: 2, status: "sehat", lastInspectionDate: new Date(Date.now() - 24 * 60000).toISOString(), disease: null },
  { treeCode: "BLK-A7-042", block: "A", row: 7, number: 42, gridCol: 3, gridRow: 2, status: "kritis", lastInspectionDate: new Date(Date.now() - 12 * 60000).toISOString(), disease: "Black Pod" },
  { treeCode: "BLK-A8-002", block: "A", row: 8, number: 2, gridCol: 0, gridRow: 3, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-A8-009", block: "A", row: 8, number: 9, gridCol: 1, gridRow: 3, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-A8-016", block: "A", row: 8, number: 16, gridCol: 2, gridRow: 3, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-A8-021", block: "A", row: 8, number: 21, gridCol: 3, gridRow: 3, status: "sehat", lastInspectionDate: null, disease: null },
];

// ----- Blok B: 4 baris × 4 kolom = 16 pohon -----
const BLOCK_B: TreeEntry[] = [
  { treeCode: "BLK-B1-001", block: "B", row: 1, number: 1, gridCol: 0, gridRow: 0, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-B1-006", block: "B", row: 1, number: 6, gridCol: 1, gridRow: 0, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-B1-010", block: "B", row: 1, number: 10, gridCol: 2, gridRow: 0, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-B1-015", block: "B", row: 1, number: 15, gridCol: 3, gridRow: 0, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-B2-004", block: "B", row: 2, number: 4, gridCol: 0, gridRow: 1, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-B2-007", block: "B", row: 2, number: 7, gridCol: 1, gridRow: 1, status: "sehat", lastInspectionDate: new Date(Date.now() - 29 * 3600000).toISOString(), disease: null },
  { treeCode: "BLK-B2-013", block: "B", row: 2, number: 13, gridCol: 2, gridRow: 1, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-B2-018", block: "B", row: 2, number: 18, gridCol: 3, gridRow: 1, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-B3-002", block: "B", row: 3, number: 2, gridCol: 0, gridRow: 2, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-B3-009", block: "B", row: 3, number: 9, gridCol: 1, gridRow: 2, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-B3-014", block: "B", row: 3, number: 14, gridCol: 2, gridRow: 2, status: "sedang", lastInspectionDate: new Date(Date.now() - 34 * 3600000).toISOString(), disease: "VSD" },
  { treeCode: "BLK-B3-020", block: "B", row: 3, number: 20, gridCol: 3, gridRow: 2, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-B4-003", block: "B", row: 4, number: 3, gridCol: 0, gridRow: 3, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-B4-008", block: "B", row: 4, number: 8, gridCol: 1, gridRow: 3, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-B4-012", block: "B", row: 4, number: 12, gridCol: 2, gridRow: 3, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-B4-017", block: "B", row: 4, number: 17, gridCol: 3, gridRow: 3, status: "sehat", lastInspectionDate: null, disease: null },
];

// ----- Blok C: 4 baris × 4 kolom = 16 pohon -----
const BLOCK_C: TreeEntry[] = [
  { treeCode: "BLK-C1-004", block: "C", row: 1, number: 4, gridCol: 0, gridRow: 0, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-C1-009", block: "C", row: 1, number: 9, gridCol: 1, gridRow: 0, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-C1-015", block: "C", row: 1, number: 15, gridCol: 2, gridRow: 0, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-C1-022", block: "C", row: 1, number: 22, gridCol: 3, gridRow: 0, status: "sehat", lastInspectionDate: new Date(Date.now() - 50 * 3600000).toISOString(), disease: null },
  { treeCode: "BLK-C2-003", block: "C", row: 2, number: 3, gridCol: 0, gridRow: 1, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-C2-008", block: "C", row: 2, number: 8, gridCol: 1, gridRow: 1, status: "sedang", lastInspectionDate: new Date(Date.now() - 5 * 3600000).toISOString(), disease: "VSD" },
  { treeCode: "BLK-C2-014", block: "C", row: 2, number: 14, gridCol: 2, gridRow: 1, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-C2-019", block: "C", row: 2, number: 19, gridCol: 3, gridRow: 1, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-C3-005", block: "C", row: 3, number: 5, gridCol: 0, gridRow: 2, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-C3-011", block: "C", row: 3, number: 11, gridCol: 1, gridRow: 2, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-C3-016", block: "C", row: 3, number: 16, gridCol: 2, gridRow: 2, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-C3-021", block: "C", row: 3, number: 21, gridCol: 3, gridRow: 2, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-C4-002", block: "C", row: 4, number: 2, gridCol: 0, gridRow: 3, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-C4-007", block: "C", row: 4, number: 7, gridCol: 1, gridRow: 3, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-C4-013", block: "C", row: 4, number: 13, gridCol: 2, gridRow: 3, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-C4-018", block: "C", row: 4, number: 18, gridCol: 3, gridRow: 3, status: "sehat", lastInspectionDate: null, disease: null },
];

// ----- Blok D: 4 baris × 4 kolom = 16 pohon -----
const BLOCK_D: TreeEntry[] = [
  { treeCode: "BLK-D1-002", block: "D", row: 1, number: 2, gridCol: 0, gridRow: 0, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-D1-006", block: "D", row: 1, number: 6, gridCol: 1, gridRow: 0, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-D1-011", block: "D", row: 1, number: 11, gridCol: 2, gridRow: 0, status: "kritis", lastInspectionDate: new Date(Date.now() - 31 * 3600000).toISOString(), disease: "CSSVD" },
  { treeCode: "BLK-D1-017", block: "D", row: 1, number: 17, gridCol: 3, gridRow: 0, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-D2-003", block: "D", row: 2, number: 3, gridCol: 0, gridRow: 1, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-D2-009", block: "D", row: 2, number: 9, gridCol: 1, gridRow: 1, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-D2-014", block: "D", row: 2, number: 14, gridCol: 2, gridRow: 1, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-D2-020", block: "D", row: 2, number: 20, gridCol: 3, gridRow: 1, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-D3-001", block: "D", row: 3, number: 1, gridCol: 0, gridRow: 2, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-D3-008", block: "D", row: 3, number: 8, gridCol: 1, gridRow: 2, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-D3-015", block: "D", row: 3, number: 15, gridCol: 2, gridRow: 2, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-D3-019", block: "D", row: 3, number: 19, gridCol: 3, gridRow: 2, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-D4-004", block: "D", row: 4, number: 4, gridCol: 0, gridRow: 3, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-D4-010", block: "D", row: 4, number: 10, gridCol: 1, gridRow: 3, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-D4-016", block: "D", row: 4, number: 16, gridCol: 2, gridRow: 3, status: "sehat", lastInspectionDate: null, disease: null },
  { treeCode: "BLK-D4-022", block: "D", row: 4, number: 22, gridCol: 3, gridRow: 3, status: "sehat", lastInspectionDate: null, disease: null },
];

/** Semua pohon terdaftar, gabungan 4 blok. */
export const TREE_REGISTRY: TreeEntry[] = [
  ...BLOCK_A,
  ...BLOCK_B,
  ...BLOCK_C,
  ...BLOCK_D,
];

/** Lookup cepat per blok — dipakai oleh SketchMapView supaya
 *  tidak perlu filter ulang setiap render. */
export const TREES_BY_BLOCK: Record<"A" | "B" | "C" | "D", TreeEntry[]> = {
  A: BLOCK_A,
  B: BLOCK_B,
  C: BLOCK_C,
  D: BLOCK_D,
};

/** Cari pohon berdasarkan kode (case-insensitive). */
export function searchTrees(query: string): TreeEntry[] {
  if (!query.trim()) return TREE_REGISTRY;
  const q = query.toLowerCase();
  return TREE_REGISTRY.filter(
    (t) =>
      t.treeCode.toLowerCase().includes(q) ||
      t.block.toLowerCase().includes(q) ||
      (t.disease ?? "").toLowerCase().includes(q)
  );
}
