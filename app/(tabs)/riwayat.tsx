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
  useNowTick(30_000);
  const filter = useInspectionStore((s) => s.filter);
  const setFilter = useInspectionStore((s) => s.setFilter);
  const searchQuery = useInspectionStore((s) => s.searchQuery);
  const setSearchQuery = useInspectionStore((s) => s.setSearchQuery);
  const getFiltered = useInspectionStore((s) => s.getFilteredInspections);
  const selectInspection = useInspectionStore((s) => s.selectInspection);

  const isConnected = useSyncQueueStore((s) => s.isConnected);
  const pendingCount = useSyncQueueStore((s) => s.pendingCount);
  const syncStatus = useSyncQueueStore((s) => s.syncStatus);
  const syncNow = useSyncQueueStore((s) => s.syncNow);

  const data = getFiltered();

  const handlePress = (item: Inspection) => {
    selectInspection(item);
    router.push("/scan/result");
  };

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <View style={s.header}>
        <Text style={s.title}>Riwayat Inspeksi</Text>
        {pendingCount > 0 && isConnected && syncStatus !== "syncing" && (
          <Pressable style={s.syncBtn} onPress={syncNow}>
            <Ionicons name="sync" size={14} color={Colors.greenMain} />
            <Text style={s.syncBtnText}>Sync</Text>
          </Pressable>
        )}
      </View>

      <SyncStatusBanner />

      <View style={s.searchBar}>
        <Ionicons name="search" size={16} color={Colors.gray400} />
        <TextInput
          placeholder="Cari tanaman / blok kebun..."
          placeholderTextColor={Colors.gray400}
          style={s.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={16} color={Colors.gray400} />
          </Pressable>
        )}
      </View>

      <View style={s.filterRow}>
        {FILTERS.map((f) => (
          <FilterChip key={f.key} label={f.label} active={filter === f.key} onPress={() => setFilter(f.key)} />
        ))}
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <InspectionListItem inspection={item} onPress={() => handlePress(item)} />
        )}
        contentContainerStyle={data.length === 0 ? s.emptyWrap : s.listContent}
        ListEmptyComponent={
          <View style={s.emptyState}>
            <Ionicons name="document-text-outline" size={48} color={Colors.gray300} />
            <Text style={s.emptyTitle}>Belum ada data inspeksi</Text>
            <Text style={s.emptySub}>
              Riwayat akan muncul setelah kamu melakukan scan tanaman pertama.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.xl, paddingTop: Spacing.sm, paddingBottom: Spacing.md },
  title: { fontSize: FontSize.xl, fontWeight: "700", color: Colors.gray900 },
  syncBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: 5, borderRadius: Radius.full, backgroundColor: Colors.greenLight },
  syncBtnText: { fontSize: FontSize.xs, fontWeight: "600", color: Colors.greenMain },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.gray100, marginHorizontal: Spacing.xl, borderRadius: 10, paddingHorizontal: Spacing.md, height: 38, gap: Spacing.sm },
  searchInput: { flex: 1, fontSize: FontSize.sm, color: Colors.gray900 },
  filterRow: { flexDirection: "row", gap: Spacing.sm, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  listContent: { paddingBottom: Spacing.xxl },
  emptyWrap: { flex: 1 },
  emptyState: { alignItems: "center", justifyContent: "center", paddingTop: 80, gap: Spacing.sm, paddingHorizontal: Spacing.xxl },
  emptyTitle: { fontSize: FontSize.md, fontWeight: "600", color: Colors.gray700 },
  emptySub: { fontSize: FontSize.sm, color: Colors.gray500, textAlign: "center", lineHeight: 20 },
});
