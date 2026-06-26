import React, { useRef, useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/Colors";
import { FontSize, Radius, Spacing } from "@/constants/Theme";
import { useScanStore } from "@/store/useScanStore";
import { useInspectionStore } from "@/store/useInspectionStore";
import { useSyncQueueStore } from "@/store/useSyncQueueStore";
import { useFormKebunStore } from "@/store/useFormKebunStore";
import { SyncStatusBanner } from "@/components/SyncStatusBanner";
import { FormKebunSheet } from "@/components/FormKebunSheet";
import { Inspection, OrganType, DISEASE_OPTIONS } from "@/mocks/inspections";
import { formatRelativeTimestamp } from "@/utils/time";
import { savePhotoLocally, uploadPhotoToCloud } from "@/utils/photoStorage";

const ORGANS: { key: OrganType; label: string }[] = [
  { key: "batang", label: "Batang" },
  { key: "daun", label: "Daun" },
  { key: "buah", label: "Buah" },
];

export default function KameraScreen() {
  const [camPermission, requestCamPermission] = useCameraPermissions();
  const [locGranted, setLocGranted] = useState(false);
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

  const { form, hydrate, showSheet, updateForm } = useFormKebunStore();

  // Sync organ target dari form ke scan store
  useEffect(() => {
    hydrate().then(() => {
      const { form: f } = useFormKebunStore.getState();
      setSelectedOrgan(f.organTarget);
      // Tampilkan sheet otomatis saat kamera dibuka
      showSheet();
    });
  }, []);

  // Sinkronisasi organ target saat form berubah
  useEffect(() => {
    setSelectedOrgan(form.organTarget);
  }, [form.organTarget]);

  useEffect(() => {
    Location.requestForegroundPermissionsAsync()
      .then(({ status }) => setLocGranted(status === "granted"))
      .catch(() => {});
  }, []);

  if (!camPermission) return <View style={s.container} />;

  if (!camPermission.granted) {
    return (
      <SafeAreaView style={s.permWrap} edges={["top", "bottom"]}>
        <Ionicons name="camera-outline" size={56} color={Colors.gray400} />
        <Text style={s.permTitle}>Izin Kamera Diperlukan</Text>
        <Text style={s.permText}>
          AI Kakao memerlukan akses kamera untuk memindai kondisi tanaman.
        </Text>
        <Pressable style={s.permBtn} onPress={requestCamPermission}>
          <Text style={s.permBtnText}>Berikan Izin Kamera</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const handleCapture = async () => {
    if (isAnalyzing) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsAnalyzing(true);

    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.75 });
      if (!photo?.uri) throw new Error("Foto tidak berhasil diambil");

      let lat = -2.1547 + (Math.random() - 0.5) * 0.01;
      let lng = 117.3821 + (Math.random() - 0.5) * 0.01;
      if (locGranted) {
        try {
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Low,
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch {}
      }

      const inspId = `insp-${Date.now()}`;
      const localUri = await savePhotoLocally(photo.uri, inspId);
      const result = buildResult(selectedOrgan, isConnected, localUri, inspId, lat, lng, form);

      if (isConnected) {
        const cloudUrl = await uploadPhotoToCloud(localUri, inspId);
        if (cloudUrl) result.cloudPhotoUrl = cloudUrl;
      } else {
        await enqueueSync(result);
      }

      await addInspection(result);
      selectInspection(result);
      setIsAnalyzing(false);
      router.push("/scan/result");
    } catch (err) {
      console.warn("Capture error:", err);
      setIsAnalyzing(false);
    }
  };

  return (
    <View style={s.container}>
      <CameraView ref={cameraRef} style={s.camera} facing={facing}>
        <SafeAreaView style={s.overlay} edges={["top"]}>
          {/* Info kebun di atas viewfinder */}
          {form.namaKebun ? (
            <View style={s.infoBar}>
              <Ionicons name="leaf" size={12} color={Colors.white} />
              <Text style={s.infoText}>
                {form.namaKebun} · Blok {form.blok} · Pohon #{form.nomorPohon}
              </Text>
              <Pressable onPress={showSheet}>
                <Ionicons name="pencil" size={12} color="rgba(255,255,255,0.7)" />
              </Pressable>
            </View>
          ) : null}

          <View style={s.statusRow}>
            <View style={s.goodBadge}>
              <View style={s.goodDot} />
              <Text style={s.goodText}>Posisi Baik</Text>
            </View>
            {!isConnected && (
              <View style={s.offlineBadge}>
                <Ionicons name="cloud-offline-outline" size={12} color={Colors.white} />
                <Text style={s.offlineText}>Offline</Text>
              </View>
            )}
          </View>

          <View style={s.framingWrap}>
            <View style={s.framingBox}>
              <View style={[s.corner, s.tl]} />
              <View style={[s.corner, s.tr]} />
              <View style={[s.corner, s.bl]} />
              <View style={[s.corner, s.br]} />
              <Text style={s.framingHint}>Arahkan ke{"\n"}organ target</Text>
            </View>
          </View>
        </SafeAreaView>
      </CameraView>

      <SafeAreaView style={s.bottom} edges={["bottom"]}>
        <SyncStatusBanner noHorizontalMargin />
        <Text style={s.organLabel}>Pilih Organ</Text>
        <View style={s.organRow}>
          {ORGANS.map((o) => (
            <Pressable
              key={o.key}
              onPress={() => {
                setSelectedOrgan(o.key);
                updateForm({ organTarget: o.key });
              }}
              style={[s.organBtn, selectedOrgan === o.key && s.organBtnActive]}
            >
              <Text style={[s.organBtnText, selectedOrgan === o.key && s.organBtnTextActive]}>
                {o.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <Pressable
          style={[s.shutter, isAnalyzing && s.shutterBusy]}
          onPress={handleCapture}
          disabled={isAnalyzing}
        >
          <View style={s.shutterInner}>
            <Ionicons
              name={isAnalyzing ? "hourglass-outline" : "camera"}
              size={24}
              color={Colors.white}
            />
          </View>
        </Pressable>
        {isAnalyzing && <Text style={s.analyzing}>Menganalisis citra...</Text>}
      </SafeAreaView>

      {/* Bottom sheet form kebun */}
      <FormKebunSheet onConfirm={() => {}} />
    </View>
  );
}

function buildResult(
  organ: OrganType,
  isConnected: boolean,
  photoUri: string,
  id: string,
  lat: number,
  lng: number,
  form: { namaOperator: string; namaKebun: string; blok: string; nomorPohon: string }
): Inspection {
  const now = new Date();
  const isHealthy = Math.random() > 0.45;
  const blockId = `BLK-${form.blok}-${form.nomorPohon.padStart(3, "0")}`;

  const base = {
    id, blockId,
    organ, latitude: lat, longitude: lng, block: "A" as const,
    synced: isConnected, photoUri,
    timestamp: formatRelativeTimestamp(now), date: now.toISOString(),
    namaOperator: form.namaOperator,
    namaKebun: form.namaKebun,
    nomorPohon: form.nomorPohon,
  };

  if (isHealthy) {
    return {
      ...base,
      disease: null, scientificName: null,
      confidence: +(92 + Math.random() * 7).toFixed(1),
      status: "sehat", severity: null,
      recommendation: ["Tidak ada tindakan diperlukan", "Lanjutkan monitoring berkala"],
    };
  }

  const diseaseList = DISEASE_OPTIONS.filter((d) => d.organ === organ);
  const disease = diseaseList[0] ?? DISEASE_OPTIONS[0];
  const conf = +(65 + Math.random() * 30).toFixed(1);
  const sev = conf > 85 ? "tinggi" : conf > 70 ? "sedang" : "rendah";

  return {
    ...base,
    disease: disease.name, scientificName: disease.scientificName,
    confidence: conf,
    status: conf > 85 ? "kritis" : "sedang",
    severity: sev,
    recommendation: sev === "tinggi"
      ? [`Tindakan segera untuk ${disease.name}`, "Semprotkan fungisida berbasis tembaga", "Eskalasi ke agronomis"]
      : ["Pangkas bagian yang menunjukkan gejala", "Aplikasikan fungisida sistemik", "Monitoring ulang dalam 7 hari"],
  };
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  camera: { flex: 1 },
  overlay: { flex: 1, alignItems: "center" },
  infoBar: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderRadius: Radius.full, marginTop: Spacing.md,
  },
  infoText: { color: Colors.white, fontSize: FontSize.xs, fontWeight: "600", flex: 1 },
  statusRow: {
    flexDirection: "row", alignItems: "center",
    gap: Spacing.sm, marginTop: Spacing.sm,
  },
  goodBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(76,175,80,0.9)",
    paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full,
  },
  goodDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.white },
  goodText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: "600" },
  offlineBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(255,167,38,0.9)",
    paddingHorizontal: Spacing.sm, paddingVertical: 6, borderRadius: Radius.full,
  },
  offlineText: { color: Colors.white, fontSize: FontSize.xs, fontWeight: "600" },
  framingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  framingBox: {
    width: 240, height: 200, borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)", borderStyle: "dashed",
    borderRadius: Radius.md, alignItems: "center", justifyContent: "center",
  },
  framingHint: { color: "rgba(255,255,255,0.5)", fontSize: FontSize.sm, textAlign: "center" },
  corner: { position: "absolute", width: 22, height: 22, borderColor: Colors.greenAccent },
  tl: { top: -2, left: -2, borderTopWidth: 3, borderLeftWidth: 3 },
  tr: { top: -2, right: -2, borderTopWidth: 3, borderRightWidth: 3 },
  bl: { bottom: -2, left: -2, borderBottomWidth: 3, borderLeftWidth: 3 },
  br: { bottom: -2, right: -2, borderBottomWidth: 3, borderRightWidth: 3 },
  bottom: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
  },
  organLabel: { fontSize: FontSize.sm, fontWeight: "600", color: Colors.gray700, marginBottom: Spacing.sm },
  organRow: { flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.lg },
  organBtn: {
    flex: 1, paddingVertical: 9, borderRadius: Radius.sm,
    borderWidth: 1.5, borderColor: Colors.gray300, alignItems: "center",
  },
  organBtnActive: { borderColor: Colors.greenMain, backgroundColor: Colors.greenLight },
  organBtnText: { fontSize: FontSize.sm, color: Colors.gray600 },
  organBtnTextActive: { color: Colors.greenMain, fontWeight: "700" },
  shutter: {
    alignSelf: "center", width: 68, height: 68, borderRadius: 34,
    borderWidth: 3, borderColor: Colors.white,
    backgroundColor: Colors.greenMain, alignItems: "center", justifyContent: "center",
  },
  shutterBusy: { opacity: 0.7 },
  shutterInner: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  analyzing: { textAlign: "center", marginTop: Spacing.sm, fontSize: FontSize.sm, color: Colors.gray600 },
  permWrap: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingHorizontal: Spacing.xxl, backgroundColor: Colors.white, gap: Spacing.sm,
  },
  permTitle: { fontSize: FontSize.lg, fontWeight: "700", color: Colors.gray900, marginTop: Spacing.md },
  permText: { fontSize: FontSize.sm, color: Colors.gray600, textAlign: "center", marginBottom: Spacing.lg },
  permBtn: { backgroundColor: Colors.greenMain, paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.md, borderRadius: Radius.md },
  permBtnText: { color: Colors.white, fontWeight: "700", fontSize: FontSize.md },
});