import React from "react";
import { Text, StyleSheet, Pressable } from "react-native";
import { Colors } from "@/constants/Colors";
import { FontSize, Radius, Spacing } from "@/constants/Theme";

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export function FilterChip({ label, active, onPress }: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
    >
      <Text style={[styles.text, active ? styles.textActive : styles.textInactive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  chipActive: {
    backgroundColor: Colors.greenMain,
  },
  chipInactive: {
    backgroundColor: Colors.gray100,
  },
  text: {
    fontSize: FontSize.sm,
    fontWeight: "500",
  },
  textActive: {
    color: Colors.white,
  },
  textInactive: {
    color: Colors.gray600,
  },
});
