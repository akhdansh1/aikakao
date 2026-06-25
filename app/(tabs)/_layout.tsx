import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";
import { useInspectionStore } from "@/store/useInspectionStore";

function TabIcon({
  name,
  color,
  size,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  size: number;
}) {
  return <Ionicons name={name} size={size} color={color} />;
}

function RiwayatIconWithBadge({ color, size }: { color: string; size: number }) {
  const kritisCount = useInspectionStore((s) => s.getStats().kritis);
  return (
    <View>
      <Ionicons name="time-outline" size={size} color={color} />
      {kritisCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{kritisCount}</Text>
        </View>
      )}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.greenMain,
        tabBarInactiveTintColor: Colors.gray400,
        tabBarStyle: {
          height: 58,
          paddingTop: 6,
          paddingBottom: 8,
          borderTopColor: Colors.gray200,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Beranda",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name={focused ? "home" : "home-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="kamera"
        options={{
          title: "Kamera",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name={focused ? "camera" : "camera-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="peta"
        options={{
          title: "Peta",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name={focused ? "map" : "map-outline"} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="riwayat"
        options={{
          title: "Riwayat",
          tabBarIcon: ({ color, size }) => (
            <RiwayatIconWithBadge color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: Colors.red,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: "700",
  },
});
