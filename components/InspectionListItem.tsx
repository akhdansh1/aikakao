import React from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, StatusBadge } from "@/constants/Colors";
import { FontSize, Radius, Spacing } from "@/constants/Theme";
import { Inspection } from "@/mocks/inspections";
import { formatRelativeTimestamp } from "@/utils/time";
import { Badge } from "./Badge";

interface InspectionListItemProps {
  inspection: Inspection;
  onPress?: () => void;
  showTime?: boolean;
}

const ORGAN_LABEL: Record<string, string> = {
  batang: "Batang",
  daun: "Daun",
  buah: "Buah",
};

export function InspectionListItem({
  inspection,
  onPress,
  showTime = true,
}: InspectionListItemProps) {
  const dotColor = StatusBadge[inspection.status].text;
  const title = inspection.disease ?? "Sehat";
  const subtitle = `${inspection.blockId} · ${ORGAN_LABEL[inspection.organ]}`;
  // Dihitung ulang setiap render (bukan dibaca dari field statis), supaya
  // label seperti "12 menit lalu" selalu akurat terhadap waktu saat ini.
  const liveTimestamp = formatRelativeTimestamp(new Date(inspection.date));

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      {inspection.photoUri ? (
        <Image source={{ uri: inspection.photoUri }} style={styles.thumbnail} />
      ) : (
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
      )}
      <View style={styles.middle}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {!inspection.synced && (
            <Ionicons
              name="cloud-offline-outline"
              size={12}
              color={Colors.orangeDark}
              style={styles.syncIcon}
            />
          )}
        </View>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle} · {inspection.confidence.toFixed(1)}%
        </Text>
      </View>
      <View style={styles.right}>
        <Badge status={inspection.status} />
        {showTime && <Text style={styles.time}>{liveTimestamp}</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.gray200,
    backgroundColor: Colors.white,
  },
  rowPressed: {
    backgroundColor: Colors.gray50,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  thumbnail: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.gray100,
  },
  middle: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  syncIcon: {
    marginLeft: 5,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.gray900,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.gray500,
    marginTop: 1,
  },
  right: {
    alignItems: "flex-end",
    gap: 3,
  },
  time: {
    fontSize: FontSize.xs,
    color: Colors.gray400,
  },
});
