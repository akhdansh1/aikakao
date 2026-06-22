import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { FontSize, Radius, Spacing } from "@/constants/Theme";
import { StatCard } from "@/components/StatCard";
import { InspectionListItem } from "@/components/InspectionListItem";
import { SyncStatusBanner } from "@/components/SyncStatusBanner";
import { OfflineModeToggle } from "@/components/OfflineModeToggle";
import { useInspectionStore } from "@/store/useInspectionStore";
import { DASHBOARD_STATS } from "@/mocks/inspections";
import { useNowTick } from "@/utils/useNowTick";

export default function DashboardScreen() {
  useNowTick();
  const inspections = useInspectionStore((s) => s.inspections);
  const selectInspection = useInspectionStore((s) => s.selectInspection);
  const recentInspections = inspections.slice(0, 3);

  const handleItemPress = (inspection: (typeof inspections)[number]) => {
    selectInspection(inspection);
    router.push("/scan/result");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header hijau dengan statistik */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Selamat pagi,</Text>
          <Text style={styles.username}>Operator</Text>

          <View style={styles.statRow}>
            <StatCard value={DASHBOARD_STATS.scanHariIni} label="Hari ini" />
            <StatCard value={DASHBOARD_STATS.terinfeksiKritis} label="Terinfeksi" />
            <StatCard value={DASHBOARD_STATS.tanamanSehat} label="Sehat" />
          </View>
        </View>

        <SyncStatusBanner />
        <OfflineModeToggle />

        {/* Aktivitas terbaru */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Aktivitas Terbaru</Text>
            <Pressable onPress={() => router.push("/(tabs)/riwayat")}>
              <Text style={styles.seeAll}>Lihat semua</Text>
            </Pressable>
          </View>

          <View style={styles.listCard}>
            {recentInspections.map((item) => (
              <InspectionListItem
                key={item.id}
                inspection={item}
                onPress={() => handleItemPress(item)}
              />
            ))}
          </View>
        </View>

        {/* CTA Mulai Scan */}
        <Pressable
          style={styles.scanButton}
          onPress={() => router.push("/(tabs)/kamera")}
        >
          <Ionicons name="camera" size={18} color={Colors.white} />
          <Text style={styles.scanButtonText}>MULAI SCAN</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  header: {
    backgroundColor: Colors.greenMain,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: Radius.lg,
    borderBottomRightRadius: Radius.lg,
  },
  greeting: {
    color: "rgba(255,255,255,0.75)",
    fontSize: FontSize.sm,
  },
  username: {
    color: Colors.white,
    fontSize: FontSize.xl,
    fontWeight: "700",
    marginTop: 2,
  },
  statRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Colors.gray900,
  },
  seeAll: {
    fontSize: FontSize.sm,
    color: Colors.greenMain,
    fontWeight: "500",
  },
  listCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    overflow: "hidden",
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.greenMain,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    paddingVertical: 14,
    borderRadius: Radius.md,
  },
  scanButtonText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
