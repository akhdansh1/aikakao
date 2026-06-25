import React, { useEffect, useState, Component } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { CustomSplashScreen } from "@/components/CustomSplashScreen";
import { useSyncQueueStore } from "@/store/useSyncQueueStore";
import { useInspectionStore } from "@/store/useInspectionStore";

SplashScreen.preventAutoHideAsync().catch(() => {});

// ─── Error Boundary ──────────────────────────────────────────────────────────
interface EBState { hasError: boolean; error: string }
class ErrorBoundary extends Component<{ children: React.ReactNode }, EBState> {
  state: EBState = { hasError: false, error: "" };
  static getDerivedStateFromError(err: Error) {
    return { hasError: true, error: err?.message ?? String(err) };
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={eb.container}>
          <Text style={eb.title}>⚠️ AI Kakao — Error</Text>
          <Text style={eb.msg}>{this.state.error}</Text>
          <Text style={eb.hint}>Kirim screenshot ini ke developer.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}
const eb = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1B4D1E", alignItems: "center", justifyContent: "center", padding: 24 },
  title: { color: "white", fontSize: 18, fontWeight: "700", marginBottom: 12, textAlign: "center" },
  msg: { color: "rgba(255,255,255,0.85)", fontSize: 12, marginBottom: 16, textAlign: "center" },
  hint: { color: "rgba(255,255,255,0.45)", fontSize: 11, textAlign: "center" },
});

// ─── App Root ─────────────────────────────────────────────────────────────────
function AppRoot() {
  const [showSplash, setShowSplash] = useState(true);
  const [ready, setReady] = useState(false);
  // useCallback agar referensi fungsi stabil — tidak memicu re-render
  // di komponen child yang menaruh onFinish di dependency array useEffect
  const handleSplashFinish = React.useCallback(() => setShowSplash(false), []);

  useEffect(() => {
    // PENTING: ambil fungsi store via getState() bukan via selector/hook.
    // Selector hook (useSyncQueueStore(s => s.fn)) mengembalikan referensi
    // baru setiap render → masuk dependency array → infinite loop.
    // getState() adalah snapshot sekali pakai yang tidak memicu re-render.
    let networkUnsub: (() => void) | undefined;

    async function startup() {
      try {
        await useInspectionStore.getState().hydrateFromStorage();
      } catch (e) {
        console.warn("hydrateInspections:", e);
      }
      try {
        await useSyncQueueStore.getState().hydrateQueueFromStorage();
      } catch (e) {
        console.warn("hydrateQueue:", e);
      }

      setReady(true);
      try { await SplashScreen.hideAsync(); } catch {}

      // Network listener dimulai setelah app siap
      setTimeout(() => {
        try {
          networkUnsub = useSyncQueueStore.getState().initNetworkListener();
        } catch (e) {
          console.warn("NetInfo:", e);
        }
      }, 800);
    }

    startup();
    return () => { networkUnsub?.(); };
  }, []); // <-- array KOSONG, hanya jalan sekali saat mount

  if (!ready) return null;

  if (showSplash) {
    return (
      <SafeAreaProvider>
        <CustomSplashScreen onFinish={handleSplashFinish} />
      </SafeAreaProvider>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="scan/result"
            options={{ presentation: "card", animation: "slide_from_right" }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AppRoot />
    </ErrorBoundary>
  );
}
