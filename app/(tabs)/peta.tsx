import React, { useState, useCallback, useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { FontSize, Radius, Spacing } from "@/constants/Theme";
import { FilterChip } from "@/components/FilterChip";
import { SketchMapView } from "@/components/SketchMapView";
import { useInspectionStore } from "@/store/useInspectionStore";
import { Inspection } from "@/mocks/inspections";
import { TREE_REGISTRY, TreeEntry } from "@/mocks/treeRegistry";
import { useScanStore } from "@/store/useScanStore";
import { formatRelativeTimestamp } from "@/utils/time";

export default function PetaScreen() {
  const inspections = useInspectionStore((s) => s.inspections);
  const selectInspection = useInspectionStore((s) => s.selectInspection);

  // PENTING: Jangan panggil getStats() di dalam selector Zustand karena
  // hasilnya selalu object baru → Zustand mendeteksi "perubahan" → re-render
  // tanpa henti (infinite loop). Gunakan useMemo sebagai gantinya.
  const stats = useMemo(() => {
    const kritis = inspections.filter((i) => i.status === "kritis").length;
    const sedang = inspections.filter((i) => i.status === "sedang").length;
    const sehat = inspections.filter((i) => i.status === "sehat").length;
    return { kritis, sedang, sehat, total: inspections.length };
  }, [inspections]);

  const [mapFilter, setMapFilter] = useState<"semua" | "kritis" | "7hari">("semua");
  const [selectedTreeCode, setSelectedTreeCode] = useState<string | null>(null);

  const visibleInspections = (() => {
    if (mapFilter === "kritis") {
      return inspections.filter((i) => i.status === "kritis");
    }
    if (mapFilter === "7hari") {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600000).toISOString();
      return inspections.filter((i) => i.date >= sevenDaysAgo);
    }
    return inspections;
  })();

  // Ambil data pohon terpilih
  const selectedTree = useMemo(() => {
    if (!selectedTreeCode) return null;
    return TREE_REGISTRY.find((t) => t.treeCode === selectedTreeCode) || null;
  }, [selectedTreeCode]);

  // Ambil diagnosis terbaru pohon terpilih
  const latestInspection = useMemo(() => {
    if (!selectedTreeCode) return null;
    return inspections.find((i) => i.blockId === selectedTreeCode) || null;
  }, [inspections, selectedTreeCode]);

  // Ambil riwayat lengkap scan pohon terpilih
  const treeHistory = useMemo(() => {
    if (!selectedTreeCode) return [];
    return inspections.filter((i) => i.blockId === selectedTreeCode);
  }, [inspections, selectedTreeCode]);

  const handleTreeSelect = useCallback((tree: TreeEntry) => {
    setSelectedTreeCode(tree.treeCode);
  }, []);

  const handleStartScan = useCallback(() => {
    if (!selectedTreeCode) return;
    useScanStore.getState().setSelectedTreeCode(selectedTreeCode);
    router.replace("/(tabs)/kamera");
  }, [selectedTreeCode]);

  const handleViewDetail = useCallback(() => {
    if (!latestInspection) return;
    selectInspection(latestInspection);
    router.push("/scan/result");
  }, [latestInspection, selectInspection]);

  // Helper untuk menentukan style warna status pohon
  const getStatusBadgeConfig = (status: string) => {
    switch (status) {
      case "kritis":
        return { bg: "#FFE5E5", text: Colors.red, label: "Kritis" };
      case "sedang":
        return { bg: "#FFF2E0", text: Colors.orange, label: "Sedang" };
      case "sehat":
        return { bg: "#E8F5E9", text: Colors.greenAccent, label: "Sehat" };
      default:
        return { bg: "#F2F2F7", text: Colors.gray500, label: "Belum Diperiksa" };
    }
  };

  const currentStatus = latestInspection?.status || selectedTree?.status || "belum-diperiksa";
  const badgeConfig = getStatusBadgeConfig(currentStatus);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Peta Kebun</Text>
        <View style={styles.headerIcons}>
          <Ionicons name="layers-outline" size={20} color={Colors.gray600} />
          <Ionicons name="filter-outline" size={20} color={Colors.gray600} />
        </View>
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        <FilterChip
          label="Semua"
          active={mapFilter === "semua"}
          onPress={() => setMapFilter("semua")}
        />
        <FilterChip
          label="Kritis"
          active={mapFilter === "kritis"}
          onPress={() => setMapFilter("kritis")}
        />
        <FilterChip
          label="7 Hari"
          active={mapFilter === "7hari"}
          onPress={() => setMapFilter("7hari")}
        />
      </View>

      {/* Map area */}
      <View style={styles.mapContainer}>
        <SketchMapView
          inspections={visibleInspections}
          selectedTreeCode={selectedTreeCode}
          onTreeSelect={handleTreeSelect}
        />
      </View>

      {/* Detail Pohon Terpilih atau Ringkasan Statistik */}
      {selectedTree ? (
        <View style={styles.detailCard}>
          {/* Header Card */}
          <View style={styles.detailHeader}>
            <View style={styles.detailTitleRow}>
              <Ionicons name="leaf-outline" size={18} color={Colors.greenMain} />
              <Text style={styles.detailTreeCode}>{selectedTree.treeCode}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: badgeConfig.bg },
                ]}
              >
                <Text style={[styles.statusBadgeText, { color: badgeConfig.text }]}>
                  {badgeConfig.label}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => setSelectedTreeCode(null)}
              style={styles.closeBtn}
            >
              <Ionicons name="close-circle" size={22} color={Colors.gray400} />
            </Pressable>
          </View>

          {/* Grid Lokasi */}
          <View style={styles.metaGrid}>
            <View style={styles.metaGridItem}>
              <Text style={styles.metaGridLabel}>Blok</Text>
              <Text style={styles.metaGridVal}>{selectedTree.block}</Text>
            </View>
            <View style={styles.metaGridDivider} />
            <View style={styles.metaGridItem}>
              <Text style={styles.metaGridLabel}>Baris</Text>
              <Text style={styles.metaGridVal}>{selectedTree.row}</Text>
            </View>
            <View style={styles.metaGridDivider} />
            <View style={styles.metaGridItem}>
              <Text style={styles.metaGridLabel}>Pohon Ke</Text>
              <Text style={styles.metaGridVal}>{selectedTree.number}</Text>
            </View>
          </View>

          {/* Info Diagnosis Terakhir */}
          <View style={styles.diagnosisSection}>
            {latestInspection ? (
              <View>
                <Text style={styles.sectionLabel}>Diagnosis Terakhir</Text>
                <View style={styles.diagnosisInfoRow}>
                  <Text style={styles.diagnosisDisease}>
                    {latestInspection.disease ?? "Sehat"}
                  </Text>
                  <Text style={styles.diagnosisConf}>
                    ({latestInspection.confidence.toFixed(1)}% Akurasi)
                  </Text>
                </View>
                <Text style={styles.diagnosisMeta}>
                  Diperiksa: {formatRelativeTimestamp(new Date(latestInspection.date))} · Organ: {latestInspection.organ}
                </Text>
              </View>
            ) : (
              <View style={styles.noHistoryWrap}>
                <Ionicons name="alert-circle-outline" size={16} color={Colors.gray400} />
                <Text style={styles.noHistoryText}>
                  Belum ada riwayat pemindaian untuk pohon ini.
                </Text>
              </View>
            )}
          </View>

          {/* Riwayat Scan Timeline (jika ada lebih dari 1) */}
          {treeHistory.length > 1 && (
            <View style={styles.historySection}>
              <Text style={styles.historySectionLabel}>
                Riwayat Pemeriksaan ({treeHistory.length})
              </Text>
              <View style={styles.historyList}>
                {treeHistory.slice(0, 2).map((item) => (
                  <View key={item.id} style={styles.historyRow}>
                    <View
                      style={[
                        styles.historyDot,
                        {
                          backgroundColor:
                            item.status === "kritis"
                              ? Colors.red
                              : item.status === "sedang"
                              ? Colors.orange
                              : Colors.greenAccent,
                        },
                      ]}
                    />
                    <Text style={styles.historyItemText}>
                      {item.disease ?? "Sehat"} ({item.confidence.toFixed(0)}%) ·{" "}
                      {formatRelativeTimestamp(new Date(item.date))}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <Pressable
              style={styles.scanBtn}
              onPress={handleStartScan}
            >
              <Ionicons name="camera" size={16} color={Colors.white} />
              <Text style={styles.scanBtnText}>
                {latestInspection ? "Pindai Ulang" : "Mulai Pindai"}
              </Text>
            </Pressable>
            {latestInspection && (
              <Pressable
                style={styles.detailBtn}
                onPress={handleViewDetail}
              >
                <Ionicons name="document-text-outline" size={16} color={Colors.gray700} />
                <Text style={styles.detailBtnText}>Detail Diagnosis</Text>
              </Pressable>
            )}
          </View>
        </View>
      ) : (
        /* Summary strip */
        <View style={styles.summaryStrip}>
          <SummaryItem value={stats.kritis} label="Kritis" color={Colors.red} />
          <View style={styles.summaryDivider} />
          <SummaryItem value={stats.sedang} label="Sedang" color={Colors.orange} />
          <View style={styles.summaryDivider} />
          <SummaryItem value={stats.sehat} label="Sehat" color={Colors.greenAccent} />
          <View style={styles.summaryDivider} />
          <SummaryItem value={stats.total} label="Total" color={Colors.gray800} />
        </View>
      )}
    </SafeAreaView>
  );
}

function SummaryItem({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.summaryItem}>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.gray900,
  },
  headerIcons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  filterRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  mapContainer: {
    marginHorizontal: Spacing.xl,
    alignItems: "center",
  },
  summaryStrip: {
    flexDirection: "row",
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    backgroundColor: Colors.gray50,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.sm,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: FontSize.lg,
    fontWeight: "700",
  },
  summaryLabel: {
    fontSize: FontSize.xs,
    color: Colors.gray500,
    marginTop: 2,
  },
  summaryDivider: {
    width: 0.5,
    backgroundColor: Colors.gray200,
  },
  // Style Detail Card Baru
  detailCard: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.gray200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  detailTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailTreeCode: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Colors.gray900,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  closeBtn: {
    padding: 2,
  },
  metaGrid: {
    flexDirection: "row",
    backgroundColor: Colors.gray50,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
    alignItems: "center",
  },
  metaGridItem: {
    flex: 1,
    alignItems: "center",
  },
  metaGridLabel: {
    fontSize: 9,
    color: Colors.gray400,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  metaGridVal: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.gray800,
    marginTop: 1,
  },
  metaGridDivider: {
    width: 0.5,
    height: 18,
    backgroundColor: Colors.gray300,
  },
  diagnosisSection: {
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.gray400,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  diagnosisInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  diagnosisDisease: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Colors.gray900,
  },
  diagnosisConf: {
    fontSize: FontSize.xs,
    color: Colors.gray600,
    fontWeight: "500",
  },
  diagnosisMeta: {
    fontSize: FontSize.xs,
    color: Colors.gray500,
    marginTop: 2,
  },
  noHistoryWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.gray50,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
  },
  noHistoryText: {
    fontSize: FontSize.xs,
    color: Colors.gray500,
    flex: 1,
  },
  historySection: {
    borderTopWidth: 0.5,
    borderTopColor: Colors.gray200,
    paddingTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  historySectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.gray400,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  historyList: {
    gap: 4,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  historyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  historyItemText: {
    fontSize: 11,
    color: Colors.gray600,
  },
  actionRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  scanBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.greenMain,
    paddingVertical: 10,
    borderRadius: Radius.sm,
  },
  scanBtnText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: "700",
  },
  detailBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.gray300,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    backgroundColor: Colors.white,
  },
  detailBtnText: {
    color: Colors.gray700,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
});
