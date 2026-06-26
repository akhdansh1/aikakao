import React, { useState } from "react";
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

export default function PetaScreen() {
  const inspections = useInspectionStore((s) => s.inspections);
  const selectInspection = useInspectionStore((s) => s.selectInspection);
  const stats = {
    total: inspections.length,
    kritis: inspections.filter((i) => i.status === "kritis").length,
    sedang: inspections.filter((i) => i.status === "sedang").length,
    sehat:  inspections.filter((i) => i.status === "sehat").length,
  };

  const [mapFilter, setMapFilter] = useState<"semua" | "kritis" | "7hari">("semua");
  const [selectedMarker, setSelectedMarker] = useState<Inspection | null>(
    inspections.find((i) => i.blockId === "BLK-A7-042") ?? null
  );

  const visibleInspections =
    mapFilter === "kritis"
      ? inspections.filter((i) => i.status === "kritis")
      : inspections;

  const handleViewDetail = () => {
    if (!selectedMarker) return;
    selectInspection(selectedMarker);
    router.push("/scan/result");
  };

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

      {/* Mode switcher: Sketsa aktif, GPS belum tersedia */}
      <View style={styles.modeSwitcher}>
        <View style={[styles.modeButton, styles.modeButtonActive]}>
          <Ionicons name="grid-outline" size={14} color={Colors.white} />
          <Text style={[styles.modeText, styles.modeTextActive]}>Sketsa 1:100</Text>
        </View>
        <Pressable
          style={[styles.modeButton, styles.modeButtonDisabled]}
          onPress={() =>
            alert(
              "Peta GPS akan diaktifkan setelah Google Maps API key dikonfigurasi. Untuk sekarang, gunakan Sketsa 1:100."
            )
          }
        >
          <Ionicons name="navigate" size={14} color={Colors.gray400} />
          <Text style={[styles.modeText, styles.modeTextDisabled]}>
            Peta GPS (segera hadir)
          </Text>
        </Pressable>
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
          selectedMarker={selectedMarker}
          onMarkerPress={setSelectedMarker}
          onViewDetail={handleViewDetail}
        />
      </View>

      {/* Summary strip */}
      <View style={styles.summaryStrip}>
        <SummaryItem value={stats.kritis} label="Kritis" color={Colors.red} />
        <View style={styles.summaryDivider} />
        <SummaryItem value={stats.sedang} label="Sedang" color={Colors.orange} />
        <View style={styles.summaryDivider} />
        <SummaryItem value={stats.sehat} label="Sehat" color={Colors.greenAccent} />
        <View style={styles.summaryDivider} />
        <SummaryItem value={stats.total} label="Total" color={Colors.gray800} />
      </View>
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
  modeSwitcher: {
    flexDirection: "row",
    marginHorizontal: Spacing.xl,
    backgroundColor: Colors.gray100,
    borderRadius: Radius.sm,
    padding: 3,
    marginBottom: Spacing.sm,
  },
  modeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 7,
    borderRadius: Radius.sm - 2,
  },
  modeButtonActive: {
    backgroundColor: Colors.greenMain,
  },
  modeButtonDisabled: {
    opacity: 0.6,
  },
  modeText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.gray600,
  },
  modeTextActive: {
    color: Colors.white,
  },
  modeTextDisabled: {
    color: Colors.gray400,
  },
  filterRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  mapContainer: {
    marginHorizontal: Spacing.xl,
  },
  summaryStrip: {
    flexDirection: "row",
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
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
});
