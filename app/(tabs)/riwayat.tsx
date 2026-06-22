import React from "react";
import { View, Text, StyleSheet, FlatList, TextInput, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { FontSize, Radius, Spacing } from "@/constants/Theme";
import { FilterChip } from "@/components/FilterChip";
import { InspectionListItem } from "@/components/InspectionListItem";
import { SyncStatusBanner } from "@/components/SyncStatusBanner";
import { useInspectionStore, FilterType } from "@/store/useInspectionStore";
import { useSyncQueueStore } from "@/store/useSyncQueueStore";
import { Inspection } from "@/mocks/inspections";
import { useNowTick } from "@/utils/useNowTick";

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "semua", label: "Semua" },
  { key: "kritis", label: "Kritis" },
  { key: "sedang", label: "Sedang" },
  { key: "hariIni", label: "Hari ini" },
];

export default function RiwayatScreen() {
  useNowTick();
  const filter = useInspectionStore((s) => s.filter);
  const setFilter = useInspectionStore((s) => s.setFilter);
  const searchQuery = useInspectionStore((s) => s.searchQuery);
  const setSearchQuery = useInspectionStore((s) => s.setSearchQuery);
  const getFilteredInspections = useInspectionStore((s) => s.getFilteredInspections);
  const selectInspection = useInspectionStore((s) => s.selectInspection);

  const isConnected = useSyncQueueStore((s) => s.isConnected);
  const pendingCount = useSyncQueueStore((s) => s.pendingCount);
  const syncStatus = useSyncQueueStore((s) => s.syncStatus);
  const syncNow = useSyncQueueStore((s) => s.syncNow);

  const data = getFilteredInspections();

  const handlePress = (inspection: Inspection) => {
    selectInspection(inspection);
    router.push("/scan/result");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Riwayat Inspeksi</Text>
        {pendingCount > 0 && isConnected && syncStatus !== "syncing" && (
          <Pressable style={styles.syncButton} onPress={syncNow}>
            <Ionicons name="sync" size={14} color={Colors.greenMain} />
            <Text style={styles.syncButtonText}>Sync sekarang</Text>
          </Pressable>
        )}
      </View>

      <SyncStatusBanner />

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color={Colors.gray400} />
        <TextInput
          placeholder="Cari tanaman / blok kebun..."
          placeholderTextColor={Colors.gray400}
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <FilterChip
            key={f.key}
            label={f.label}
            active={filter === f.key}
            onPress={() => setFilter(f.key)}
          />
        ))}
      </View>

      {/* List */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <InspectionListItem inspection={item} onPress={() => handlePress(item)} />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={40} color={Colors.gray300} />
            <Text style={styles.emptyText}>Tidak ada hasil inspeksi ditemukan.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.gray900,
  },
  syncButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.full,
    backgroundColor: Colors.greenLight,
  },
  syncButtonText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.greenMain,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.gray100,
    marginHorizontal: Spacing.xl,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    height: 38,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.gray900,
  },
  filterRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  listContent: {
    paddingBottom: Spacing.xxl,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Spacing.xxxl * 2,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.gray500,
  },
});
