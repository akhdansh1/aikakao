import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Image, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import { FontSize, Spacing } from "@/constants/Theme";

interface CustomSplashScreenProps {
  onFinish: () => void;
  durationMs?: number;
}

export function CustomSplashScreen({
  onFinish,
  durationMs = 2200,
}: CustomSplashScreenProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: durationMs,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    const timer = setTimeout(onFinish, durationMs + 250);
    return () => clearTimeout(timer);
  }, [durationMs, onFinish, progress]);

  const widthInterpolate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <LinearGradient
      colors={[Colors.greenDark, Colors.greenMain, "#1a3d1c"]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.container}
    >
      {/* App icon */}
      <View style={styles.iconBox}>
        <Text style={styles.iconEmoji}>🌿</Text>
      </View>

      <Text style={styles.appName}>AI Kakao</Text>
      <Text style={styles.tagline}>SISTEM DIAGNOSIS PENYAKIT KAKAO</Text>

      <View style={styles.divider} />

      <Text style={styles.byLabel}>DIDUKUNG OLEH</Text>
      <View style={styles.logoRow}>
        <View style={styles.logoPill}>
          {/* Ganti require ini dengan path logo asli di assets/images/ */}
          <Image
            source={require("@/assets/images/itsb-logo.png")}
            style={styles.logoItsb}
            resizeMode="contain"
          />
        </View>
        <View style={styles.logoPill}>
          <Image
            source={require("@/assets/images/berau-logo.png")}
            style={styles.logoBerau}
            resizeMode="contain"
          />
        </View>
      </View>

      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: widthInterpolate }]} />
      </View>
      <Text style={styles.loadingText}>Memuat sistem...</Text>

      <Text style={styles.version}>v1.0.0 · ITSB LP3B</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xxl,
  },
  iconBox: {
    width: 84,
    height: 84,
    backgroundColor: Colors.white,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  iconEmoji: {
    fontSize: 44,
  },
  appName: {
    color: Colors.white,
    fontSize: FontSize.xxxl,
    fontWeight: "800",
    letterSpacing: 1,
  },
  tagline: {
    color: "rgba(255,255,255,0.6)",
    fontSize: FontSize.xs,
    letterSpacing: 1.5,
    marginTop: 4,
    marginBottom: Spacing.xxl + Spacing.sm,
    textAlign: "center",
  },
  divider: {
    width: 56,
    height: 1.5,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    marginBottom: Spacing.xxl + Spacing.sm,
  },
  byLabel: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 9,
    letterSpacing: 1.4,
    marginBottom: Spacing.md,
  },
  logoRow: {
    flexDirection: "row",
    gap: Spacing.lg,
    alignItems: "center",
    marginBottom: Spacing.xxxl + Spacing.lg,
  },
  logoPill: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  logoItsb: {
    height: 26,
    width: 60,
  },
  logoBerau: {
    height: 26,
    width: 60,
  },
  progressTrack: {
    width: 160,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 2,
  },
  loadingText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: FontSize.xs,
    marginTop: Spacing.sm,
  },
  version: {
    position: "absolute",
    bottom: Spacing.xl,
    color: "rgba(255,255,255,0.25)",
    fontSize: FontSize.xs,
  },
});
