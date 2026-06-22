import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { CustomSplashScreen } from "@/components/CustomSplashScreen";
import { useSyncQueueStore } from "@/store/useSyncQueueStore";

// Cegah native splash auto-hide; kita kontrol manual supaya transisi ke
// custom splash (animasi logo brand + reveal logo partner) terasa mulus,
// tanpa jeda kosong di antara native splash dan custom splash React.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [showCustomSplash, setShowCustomSplash] = useState(true);
  const [appIsReady, setAppIsReady] = useState(false);
  const initNetworkListener = useSyncQueueStore((s) => s.initNetworkListener);
  const hydrateQueueFromStorage = useSyncQueueStore((s) => s.hydrateQueueFromStorage);

  useEffect(() => {
    async function prepare() {
      try {
        // Muat ulang antrian offline yang tersimpan dari sesi sebelumnya,
        // lalu mulai memantau status koneksi untuk auto-sync.
        await hydrateQueueFromStorage();
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }
    prepare();

    const unsubscribe = initNetworkListener();
    return unsubscribe;
  }, [hydrateQueueFromStorage, initNetworkListener]);

  if (!appIsReady) {
    return null;
  }

  if (showCustomSplash) {
    return (
      <SafeAreaProvider>
        <CustomSplashScreen onFinish={() => setShowCustomSplash(false)} />
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
            options={{
              presentation: "card",
              animation: "slide_from_right",
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
