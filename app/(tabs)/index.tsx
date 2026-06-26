import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { FontSize, Radius, Spacing } from "@/constants/Theme";
import { InspectionListItem } from "@/components/InspectionListItem";
import { SyncStatusBanner } from "@/components/SyncStatusBanner";
import { OfflineModeToggle } from "@/components/OfflineModeToggle";
import { DashboardHeader } from "@/components/DashboardHeader";
import { FormKebunSheet } from "@/components/FormKebunSheet";
import { useInspectionStore } from "@/store/useInspectionStore";
import { useFormKebunStore } from "@/store/useFormKebunStore";
import { useNowTick } from "@/utils/useNowTick";
import { Inspection } from "@/mocks/inspections";

export default function DashboardScreen() {
  useNowTick(30_000);

  const inspections = useInspectionStore((s) => s.inspections);
  const selectInspection = useInspectionStore((s) => s.selectInspection);
  const recent = inspections.slice(0, 3);
  const stats = {
    total: inspections.length,
    kritis: inspections.filter((i) => i.status === "kritis").length,
    sedang: inspections.filter((i) => i.status === "sedang").length,
    sehat: inspections.filter((i) => i.status === "sehat").length,
  };

  const { hydrate, showSheet } = useFormKebunStore();

  useEffect(() => {
    hydrate();
  }, []);

  const handleConfirm = () => {
    router.push("/(tabs)/kamera");
  };

  const handleItemPress = (item: Inspection) => {
    selectInspection(item);
    router.push("/scan/result");
  };

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <DashboardHeader operatorName="Operator" />

        {/* Stat cards */}
        <View style={s.statRow}>
          <StatCard value={stats.total} label="Total Scan" color={Colors.greenMain} />
          <StatCard value={stats.kritis} label="Kritis" color={Colors.red} />
          <StatCard value={stats.sedang} label="Sedang" color={Colors.orange} />
          <StatCard value={stats.sehat} label="Sehat" color={Colors.greenAccent} />
        </View>

        <SyncStatusBanner />
        <OfflineModeToggle />

        {/* Aktivitas terbaru */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Aktivitas Terbaru</Text>
            <Pressable onPress={() => router.push("/(tabs)/riwayat")}>
              <Text style={s.seeAll}>Lihat semua</Text>
            </Pressable>
          </View>

          {recent.length === 0 ? (
            <View style={s.emptyCard}>
              <Ionicons name="leaf-outline" size={36} color={Colors.gray300} />
              <Text style={s.emptyTitle}>Belum ada data inspeksi</Text>
              <Text style={s.emptySub}>Mulai scan tanaman kakao pertamamu.</Text>
            </View>
          ) : (
            <View style={s.listCard}>
              {recent.map((item) => (
                <InspectionListItem
                  key={item.id}
                  inspection={item}
                  onPress={() => handleItemPress(item)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Tombol scan — trigger bottom sheet form kebun */}
        <Pressable style={s.btn} onPress={showSheet}>
          <Ionicons name="camera" size={18} color={Colors.white} />
          <Text style={s.btnText}>MULAI SCAN TANAMAN</Text>
        </Pressable>
      </ScrollView>

      {/* Bottom sheet form kebun */}
      <FormKebunSheet onConfirm={handleConfirm} />
    </SafeAreaView>
  );
}

function StatCard({
  value, label, color,
}: {
  value: number; label: string; color: string;
}) {
  return (
    <View style={s.statCard}>
      <Text style={[s.statVal, { color }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.greenMain },
  scroll: { flex: 1, backgroundColor: Colors.gray50 },
  content: { paddingBottom: Spacing.xxl },
  statRow: {
    flexDirection: "row", gap: Spacing.sm,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg,
    backgroundColor: Colors.white,
  },
  statCard: {
    flex: 1, alignItems: "center", paddingVertical: Spacing.sm,
    backgroundColor: Colors.gray50, borderRadius: Radius.sm,
  },
  statVal: { fontSize: FontSize.xxl, fontWeight: "700" },
  statLabel: { fontSize: FontSize.xs, color: Colors.gray600, marginTop: 2, textAlign: "center" },
  section: { paddingHorizontal: Spacing.xl, marginTop: Spacing.lg },
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: Spacing.sm,
  },
  sectionTitle: { fontSize: FontSize.md, fontWeight: "700", color: Colors.gray900 },
  seeAll: { fontSize: FontSize.sm, color: Colors.greenMain, fontWeight: "500" },
  listCard: { backgroundColor: Colors.white, borderRadius: Radius.md, overflow: "hidden" },
  emptyCard: {
    backgroundColor: Colors.white, borderRadius: Radius.md,
    padding: Spacing.xxl, alignItems: "center", gap: Spacing.sm,
  },
  emptyTitle: { fontSize: FontSize.md, fontWeight: "600", color: Colors.gray700 },
  emptySub: { fontSize: FontSize.sm, color: Colors.gray500, textAlign: "center" },
  btn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: Spacing.sm, backgroundColor: Colors.greenMain,
    marginHorizontal: Spacing.xl, marginTop: Spacing.xl,
    paddingVertical: 14, borderRadius: Radius.md,
    shadowColor: Colors.greenDark, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  btnText: { color: Colors.white, fontSize: FontSize.md, fontWeight: "700", letterSpacing: 0.5 },
});