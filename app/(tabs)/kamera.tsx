import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/Colors";
import { FontSize, Radius, Spacing } from "@/constants/Theme";
import { useScanStore } from "@/store/useScanStore";
import { useInspectionStore } from "@/store/useInspectionStore";
import { useSyncQueueStore } from "@/store/useSyncQueueStore";
import { SyncStatusBanner } from "@/components/SyncStatusBanner";
import { OrganType, Inspection, DISEASE_OPTIONS } from "@/mocks/inspections";
import { formatRelativeTimestamp } from "@/utils/time";

const ORGANS: { key: OrganType; label: string }[] = [
  { key: "batang", label: "Batang" },
  { key: "daun", label: "Daun" },
  { key: "buah", label: "Buah" },
];

export default function KameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing] = useState<CameraType>("back");
  const cameraRef = useRef<CameraView>(null);

  const selectedOrgan = useScanStore((s) => s.selectedOrgan);
  const setSelectedOrgan = useScanStore((s) => s.setSelectedOrgan);
  const isAnalyzing = useScanStore((s) => s.isAnalyzing);
  const setIsAnalyzing = useScanStore((s) => s.setIsAnalyzing);

  const addInspection = useInspectionStore((s) => s.addInspection);
  const selectInspection = useInspectionStore((s) => s.selectInspection);

  const isConnected = useSyncQueueStore((s) => s.isConnected);
  const enqueueSync = useSyncQueueStore((s) => s.enqueue);

  // Permission belum diberikan
  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer} edges={["top", "bottom"]}>
        <Ionicons name="camera-outline" size={56} color={Colors.gray400} />
        <Text style={styles.permissionTitle}>Izin Kamera Diperlukan</Text>
        <Text style={styles.permissionText}>
          AI Kakao memerlukan akses kamera untuk memindai kondisi tanaman.
        </Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Berikan Izin</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const handleCapture = async () => {
    if (isAnalyzing) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsAnalyzing(true);

    try {
      // Ambil foto sungguhan dari kamera aktif. base64 dimatikan (tidak perlu,
      // cukup pakai file URI lokal) supaya proses lebih cepat & hemat memori.
      const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.7,
        skipProcessing: true,
      });
      const photoUri = photo?.uri;

      // Simulasi proses diagnosis AI (mock) — yang diganti nanti hanyalah
      // BAGIAN INI dengan panggilan API model sungguhan; foto yang sudah
      // diambil di atas tetap dipakai sebagai payload upload.
      // Analisis tetap berjalan secara lokal meski offline — sesuai
      // prinsip "Mode Offline dengan Auto-Sync": citra & metadata
      // disimpan dahulu, lalu disinkronkan begitu koneksi tersedia.
      setTimeout(async () => {
        const mockResult = generateMockResult(selectedOrgan, isConnected, photoUri);
        addInspection(mockResult);
        selectInspection(mockResult);

        if (!mockResult.synced) {
          await enqueueSync(mockResult);
        }

        setIsAnalyzing(false);
        router.push("/scan/result");
      }, 1600);
    } catch (err) {
      console.warn("Gagal mengambil foto:", err);
      setIsAnalyzing(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        <SafeAreaView style={styles.overlaySafeArea} edges={["top"]}>
          {/* Status row: posisi framing + indikator koneksi */}
          <View style={styles.topStatusRow}>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Posisi Baik</Text>
            </View>
            {!isConnected && (
              <View style={styles.offlineBadge}>
                <Ionicons name="cloud-offline-outline" size={12} color={Colors.white} />
                <Text style={styles.offlineBadgeText}>Offline</Text>
              </View>
            )}
          </View>

          {/* Guided framing box */}
          <View style={styles.framingWrap}>
            <View style={styles.framingBox}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
              <Text style={styles.framingHint}>Arahkan ke{"\n"}organ target</Text>
            </View>
          </View>
        </SafeAreaView>
      </CameraView>

      {/* Bottom controls (luar CameraView agar tidak ikut ter-crop di beberapa device) */}
      <SafeAreaView style={styles.bottomPanel} edges={["bottom"]}>
        <SyncStatusBanner noHorizontalMargin />
        <Text style={styles.organLabel}>Pilih Organ</Text>
        <View style={styles.organRow}>
          {ORGANS.map((organ) => (
            <Pressable
              key={organ.key}
              onPress={() => setSelectedOrgan(organ.key)}
              style={[
                styles.organButton,
                selectedOrgan === organ.key && styles.organButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.organButtonText,
                  selectedOrgan === organ.key && styles.organButtonTextActive,
                ]}
              >
                {organ.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[styles.shutterButton, isAnalyzing && styles.shutterButtonBusy]}
          onPress={handleCapture}
          disabled={isAnalyzing}
        >
          <View style={styles.shutterInner}>
            {isAnalyzing ? (
              <Ionicons name="hourglass-outline" size={22} color={Colors.white} />
            ) : (
              <Ionicons name="camera" size={24} color={Colors.white} />
            )}
          </View>
        </Pressable>
        {isAnalyzing && <Text style={styles.analyzingText}>Menganalisis citra...</Text>}
      </SafeAreaView>
    </View>
  );
}

/**
 * Mock diagnosis generator — menghasilkan hasil acak yang realistis
 * sesuai organ yang dipilih, untuk simulasi sebelum backend ML tersedia.
 */
function generateMockResult(
  organ: OrganType,
  isConnected: boolean,
  photoUri?: string
): Inspection {
  const isHealthy = Math.random() > 0.45;
  const now = new Date();
  const id = `insp-${Date.now()}`;
  const blockId = `BLK-${["A", "B", "C", "D"][Math.floor(Math.random() * 4)]}${Math.floor(
    Math.random() * 9
  )}-${String(Math.floor(Math.random() * 99)).padStart(3, "0")}`;

  if (isHealthy) {
    return {
      id,
      blockId,
      disease: null,
      scientificName: null,
      confidence: Math.round((92 + Math.random() * 7) * 10) / 10,
      organ,
      status: "sehat",
      severity: null,
      recommendation: ["Tidak ada tindakan diperlukan", "Lanjutkan monitoring berkala"],
      timestamp: formatRelativeTimestamp(now),
      date: now.toISOString(),
      latitude: -2.1547 + (Math.random() - 0.5) * 0.01,
      longitude: 117.3821 + (Math.random() - 0.5) * 0.01,
      block: "A",
      synced: isConnected,
      photoUri,
    };
  }

  const diseaseOptions = DISEASE_OPTIONS.filter((d) => d.organ === organ);
  const disease = diseaseOptions[0] ?? DISEASE_OPTIONS[0];
  const confidence = Math.round((65 + Math.random() * 30) * 10) / 10;
  const severity = confidence > 85 ? "tinggi" : confidence > 70 ? "sedang" : "rendah";
  const status = confidence > 85 ? "kritis" : "sedang";

  return {
    id,
    blockId,
    disease: disease.name,
    scientificName: disease.scientificName,
    confidence,
    organ,
    status,
    severity,
    recommendation:
      severity === "tinggi"
        ? [
            `Tindakan segera untuk ${disease.name}`,
            "Semprotkan fungisida berbasis tembaga",
            "Eskalasi ke agronomis",
          ]
        : [
            "Pangkas bagian yang menunjukkan gejala",
            "Aplikasikan fungisida sistemik",
            "Monitoring ulang dalam 7 hari",
          ],
    timestamp: formatRelativeTimestamp(now),
    date: now.toISOString(),
    latitude: -2.1547 + (Math.random() - 0.5) * 0.01,
    longitude: 117.3821 + (Math.random() - 0.5) * 0.01,
    block: "A",
    synced: isConnected,
    photoUri,
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  camera: {
    flex: 1,
  },
  overlaySafeArea: {
    flex: 1,
    alignItems: "center",
  },
  topStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  offlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,167,38,0.92)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  offlineBadgeText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: "600",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(76,175,80,0.9)",
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.white,
  },
  statusText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  framingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  framingBox: {
    width: 240,
    height: 200,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)",
    borderStyle: "dashed",
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  framingHint: {
    color: "rgba(255,255,255,0.5)",
    fontSize: FontSize.sm,
    textAlign: "center",
  },
  corner: {
    position: "absolute",
    width: 22,
    height: 22,
    borderColor: Colors.greenAccent,
  },
  cornerTL: { top: -2, left: -2, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTR: { top: -2, right: -2, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBL: { bottom: -2, left: -2, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBR: { bottom: -2, right: -2, borderBottomWidth: 3, borderRightWidth: 3 },
  bottomPanel: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  organLabel: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.gray700,
    marginBottom: Spacing.sm,
  },
  organRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  organButton: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: Colors.gray300,
    alignItems: "center",
  },
  organButtonActive: {
    borderColor: Colors.greenMain,
    backgroundColor: Colors.greenLight,
  },
  organButtonText: {
    fontSize: FontSize.sm,
    color: Colors.gray600,
  },
  organButtonTextActive: {
    color: Colors.greenMain,
    fontWeight: "700",
  },
  shutterButton: {
    alignSelf: "center",
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: Colors.white,
    backgroundColor: Colors.greenMain,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.greenMain,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  shutterButtonBusy: {
    opacity: 0.7,
  },
  shutterInner: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  analyzingText: {
    textAlign: "center",
    marginTop: Spacing.sm,
    fontSize: FontSize.sm,
    color: Colors.gray600,
  },
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xxl,
    backgroundColor: Colors.white,
    gap: Spacing.sm,
  },
  permissionTitle: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.gray900,
    marginTop: Spacing.md,
  },
  permissionText: {
    fontSize: FontSize.sm,
    color: Colors.gray600,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  permissionButton: {
    backgroundColor: Colors.greenMain,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  permissionButtonText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: FontSize.md,
  },
});
