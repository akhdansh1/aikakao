import React from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { FontSize, Radius, Spacing } from "@/constants/Theme";
import { useSyncQueueStore } from "@/store/useSyncQueueStore";

/**
 * Toggle ini memaksa status koneksi aplikasi seolah-olah offline,
 * terlepas dari koneksi internet device yang sesungguhnya. Berguna
 * untuk mendemonstrasikan alur "Mode Offline dengan Auto-Sync" tanpa
 * perlu benar-benar mematikan WiFi/data seluler perangkat saat presentasi.
 */
export function OfflineModeToggle() {
  const manualOfflineMode = useSyncQueueStore((s) => s.manualOfflineMode);
  const setManualOfflineMode = useSyncQueueStore((s) => s.setManualOfflineMode);
  const pendingCount = useSyncQueueStore((s) => s.pendingCount);

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Ionicons
          name={manualOfflineMode ? "cloud-offline" : "cloud-done-outline"}
          size={18}
          color={manualOfflineMode ? Colors.orangeDark : Colors.greenMain}
        />
        <View>
          <Text style={styles.title}>Simulasikan Mode Offline</Text>
          <Text style={styles.subtitle}>
            {manualOfflineMode
              ? `Aktif — ${pendingCount} data menunggu sinkronisasi`
              : "Untuk demo alur kerja offline & auto-sync"}
          </Text>
        </View>
      </View>
      <Switch
        value={manualOfflineMode}
        onValueChange={setManualOfflineMode}
        trackColor={{ false: Colors.gray300, true: Colors.orange }}
        thumbColor={Colors.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flex: 1,
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.gray900,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.gray500,
    marginTop: 1,
  },
});
