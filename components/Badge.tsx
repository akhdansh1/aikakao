import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { StatusBadge } from "@/constants/Colors";
import { FontSize, Radius, Spacing } from "@/constants/Theme";
import { StatusLevel } from "@/mocks/inspections";

interface BadgeProps {
  status: StatusLevel;
}

export function Badge({ status }: BadgeProps) {
  const config = StatusBadge[status];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: "600",
  },
});
