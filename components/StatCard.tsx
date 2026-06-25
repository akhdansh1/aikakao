import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";
import { FontSize, Radius, Spacing } from "@/constants/Theme";

interface StatCardProps {
  value: string | number;
  label: string;
  variant?: "onDark" | "onLight";
}

export function StatCard({ value, label, variant = "onDark" }: StatCardProps) {
  const isDark = variant === "onDark";
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: isDark ? "rgba(255,255,255,0.2)" : Colors.gray100 },
      ]}
    >
      <Text style={[styles.value, { color: isDark ? Colors.white : Colors.gray900 }]}>
        {value}
      </Text>
      <Text
        style={[
          styles.label,
          { color: isDark ? "rgba(255,255,255,0.85)" : Colors.gray600 },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    alignItems: "center",
  },
  value: {
    fontSize: FontSize.xxl,
    fontWeight: "700",
  },
  label: {
    fontSize: FontSize.xs,
    marginTop: 2,
    textAlign: "center",
  },
});
