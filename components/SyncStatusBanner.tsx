import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { FontSize, Radius, Spacing } from "@/constants/Theme";
import { useSyncQueueStore } from "@/store/useSyncQueueStore";

interface SyncStatusBannerProps {
  noHorizontalMargin?: boolean;
}

export function SyncStatusBanner({ noHorizontalMargin }: SyncStatusBannerProps = {}) {
  const isConnected = useSyncQueueStore((s) => s.isConnected);
  const pendingCount = useSyncQueueStore((s) => s.pendingCount);
  const syncStatus = useSyncQueueStore((s) => s.syncStatus);

  const marginStyle = noHorizontalMargin ? { marginHorizontal: 0 } : undefined;

  // Tidak ada apa pun untuk ditampilkan: online dan tidak ada antrian.
  if (isConnected && pendingCount === 0) return null;

  if (!isConnected) {
    return (
      <View style={[styles.banner, styles.bannerOffline, marginStyle]}>
        <Ionicons name="cloud-offline-outline" size={15} color={Colors.orangeDark} />
        <Text style={styles.textOffline}>
          Mode offline
          {pendingCount > 0 ? ` · ${pendingCount} data tersimpan lokal` : ""}
        </Text>
      </View>
    );
  }

  if (syncStatus === "syncing") {
    return (
      <View style={[styles.banner, styles.bannerSyncing, marginStyle]}>
        <ActivityIndicator size="small" color={Colors.blue} />
        <Text style={styles.textSyncing}>Menyinkronkan {pendingCount} data...</Text>
      </View>
    );
  }

  if (pendingCount > 0) {
    return (
      <View style={[styles.banner, styles.bannerPending, marginStyle]}>
        <Ionicons name="cloud-upload-outline" size={15} color={Colors.greenDarkText} />
        <Text style={styles.textPending}>{pendingCount} data menunggu sinkronisasi</Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.sm,
  },
  bannerOffline: {
    backgroundColor: Colors.orangeBg,
  },
  bannerSyncing: {
    backgroundColor: Colors.blueBg,
  },
  bannerPending: {
    backgroundColor: Colors.greenBg,
  },
  textOffline: {
    fontSize: FontSize.xs,
    color: Colors.orangeDark,
    fontWeight: "600",
    flex: 1,
  },
  textSyncing: {
    fontSize: FontSize.xs,
    color: Colors.blue,
    fontWeight: "600",
    flex: 1,
  },
  textPending: {
    fontSize: FontSize.xs,
    color: Colors.greenDarkText,
    fontWeight: "600",
    flex: 1,
  },
});
