import React, { useRef, useState, useCallback } from "react";
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
import { TreeSearchModal } from "@/components/TreeSearchModal";
import { OrganType, Inspection, DISEASE_OPTIONS } from "@/mocks/inspections";
import { TreeEntry, TREE_REGISTRY } from "@/mocks/treeRegistry";
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
  const [showTreeSearch, setShowTreeSearch] = useState(false);

  const selectedOrgan = useScanStore((s) => s.selectedOrgan);
  const setSelectedOrgan = useScanStore((s) => s.setSelectedOrgan);
  const selectedTreeCode = useScanStore((s) => s.selectedTreeCode);
  const setSelectedTreeCode = useScanStore((s) => s.setSelectedTreeCode);
  const isAnalyzing = useScanStore((s) => s.isAnalyzing);
  const setIsAnalyzing = useScanStore((s) => s.setIsAnalyzing);

  const addInspection = useInspectionStore((s) => s.addInspection);
  const selectInspection = useInspectionStore((s) => s.selectInspection);

  const isConnected = useSyncQueueStore((s) => s.isConnected);
  const enqueueSync = useSyncQueueStore((s) => s.enqueue);

  const handleTreeSelect = useCallback(
    (tree: TreeEntry) => {
      setSelectedTreeCode(tree.treeCode);
      setShowTreeSearch(false);
    },
    [setSelectedTreeCode]
  );

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

  // --- STEP 1: Belum pilih pohon → tampil layar pemilihan ---
  if (!selectedTreeCode) {
    return (
      <SafeAreaView style={styles.selectTreeContainer} edges={["top", "bottom"]}>
        <View style={styles.selectTreeContent}>
          <View style={styles.selectTreeIconWrap}>
            <Ionicons name="leaf" size={48} color={Colors.greenMain} />
          </View>
          <Text style={styles.selectTreeTitle}>Pilih Pohon Terlebih Dahulu</Text>
          <Text style={styles.selectTreeDesc}>
            Cari dan pilih kode pohon yang akan diperiksa sebelum mengambil foto.
          </Text>
          <Pressable
            style={styles.selectTreeButton}
            onPress={() => setShowTreeSearch(true)}
          >
            <Ionicons name="search" size={18} color={Colors.white} />
            <Text style={styles.selectTreeButtonText}>Cari Kode Pohon</Text>
          </Pressable>
          <Text style={styles.selectTreeHint}>
            {TREE_REGISTRY.length} pohon terdaftar di 4 blok
          </Text>
        </View>

        <TreeSearchModal
          visible={showTreeSearch}
          onClose={() => setShowTreeSearch(false)}
          onSelect={handleTreeSelect}
        />
      </SafeAreaView>
    );
  }

  // --- STEP 2: Pohon sudah dipilih → tampil kamera ---
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
        const mockResult = generateMockResult(
          selectedOrgan,
          selectedTreeCode,
          isConnected,
          photoUri
        );
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

  const handleChangeTree = () => {
    setSelectedTreeCode(null);
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        <SafeAreaView style={styles.overlaySafeArea} edges={["top"]}>
          {/* Status row: posisi framing + kode pohon terpilih */}
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

          {/* Badge kode pohon terpilih */}
          <Pressable style={styles.treeBadge} onPress={handleChangeTree}>
            <Ionicons name="leaf" size={13} color={Colors.greenMain} />
            <Text style={styles.treeBadgeText}>{selectedTreeCode}</Text>
            <Ionicons name="swap-horizontal" size={13} color={Colors.gray500} />
          </Pressable>

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
 * Sekarang menggunakan kode pohon yang dipilih user, bukan random.
 */
function generateMockResult(
  organ: OrganType,
  treeCode: string,
  isConnected: boolean,
  photoUri?: string
): Inspection {
  const isHealthy = Math.random() > 0.45;
  const now = new Date();
  const id = `insp-${Date.now()}`;
  // Ambil blok dari treeCode (karakter ke-4)
  const blockLetter = treeCode.charAt(4) as "A" | "B" | "C" | "D";

  if (isHealthy) {
    return {
      id,
      blockId: treeCode,
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
      block: blockLetter,
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
    blockId: treeCode,
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
    block: blockLetter,
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
  treeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    marginTop: Spacing.sm,
  },
  treeBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.gray900,
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
  // --- Select Tree Step styles ---
  selectTreeContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  selectTreeContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xxxl,
  },
  selectTreeIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.greenLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  selectTreeTitle: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.gray900,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  selectTreeDesc: {
    fontSize: FontSize.sm,
    color: Colors.gray600,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: Spacing.xxl,
  },
  selectTreeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.greenMain,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: 14,
    borderRadius: Radius.md,
    width: "100%",
  },
  selectTreeButtonText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: "700",
  },
  selectTreeHint: {
    fontSize: FontSize.xs,
    color: Colors.gray400,
    marginTop: Spacing.md,
  },
});
