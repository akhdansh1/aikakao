import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Image, Share, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Severity } from "@/constants/Colors";
import { FontSize, Radius, Spacing } from "@/constants/Theme";
import { useInspectionStore } from "@/store/useInspectionStore";
import { useScanStore } from "@/store/useScanStore";
import { formatRelativeTimestamp } from "@/utils/time";

const ORGAN_LABEL: Record<string, string> = {
  batang: "Batang",
  daun: "Daun",
  buah: "Buah",
};

export default function ResultScreen() {
  const inspection = useInspectionStore((s) => s.selectedInspection);
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "info";
  }>({
    visible: false,
    message: "",
    type: "success",
  });

  if (!inspection) {
    return (
      <SafeAreaView style={styles.emptyState}>
        <Text style={styles.emptyText}>Tidak ada hasil untuk ditampilkan.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Kembali</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const isHealthy = inspection.status === "sehat";
  const severityConfig = inspection.severity ? Severity[inspection.severity] : null;

  // Fungsi pembantu menampilkan Toast UI kustom lalu kembali ke kamera
  const triggerToast = (message: string, type: "success" | "info" = "success") => {
    setToast({
      visible: true,
      message,
      type,
    });

    // Reset scan state agar siklus pemilihan kode pohon dimulai dari awal
    useScanStore.getState().resetScan();

    // Otomatis arahkan kembali ke Kamera setelah 1.8 detik agar pengguna bisa lanjut tugas lain
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
      router.replace("/(tabs)/kamera");
    }, 1800);
  };

  const handleSave = () => {
    if (isSaving || isSharing) return;
    setIsSaving(true);

    // Dummy loading 1.2s sebelum menyimpan & menampilkan Toast
    setTimeout(() => {
      setIsSaving(false);
      triggerToast("Diagnosis berhasil disimpan ke riwayat!");
    }, 1200);
  };

  const handleShare = () => {
    if (isSaving || isSharing) return;
    setIsSharing(true);

    // Dummy loading 1.2s sebelum memicu share sheet & Toast
    setTimeout(async () => {
      setIsSharing(false);

      const severityLabel = severityConfig ? severityConfig.label : "Sehat";
      const statusText = isHealthy ? "Sehat" : `Terdeteksi ${inspection.disease}`;
      const message = `[Diagnosis Kesehatan Cokelat - AI Kakao]
-------------------------------------------
Kode Pohon : ${inspection.blockId}
Organ      : ${ORGAN_LABEL[inspection.organ] || inspection.organ}
Status     : ${statusText}
Confidence : ${inspection.confidence.toFixed(1)}%
Keparahan  : ${severityLabel}

Rekomendasi Tindakan:
${inspection.recommendation.map((rec, idx) => `${idx + 1}. ${rec}`).join("\n")}

Diperiksa pada: ${formatRelativeTimestamp(new Date(inspection.date))}
-------------------------------------------
Pindai kondisi kebun kakao secara cerdas menggunakan aplikasi AI Kakao.`;

      if (Platform.OS === "web") {
        const webNav = typeof navigator !== "undefined" ? (navigator as any) : null;
        if (webNav && webNav.share) {
          try {
            await webNav.share({
              title: `Diagnosis Pohon Kakao ${inspection.blockId}`,
              text: message,
            });
          } catch (err) {
            console.log("Web share cancelled:", err);
          }
        } else if (webNav && webNav.clipboard) {
          try {
            await webNav.clipboard.writeText(message);
          } catch (err) {
            console.warn("Gagal menyalin teks:", err);
          }
        }
      } else {
        try {
          await Share.share({
            message,
            title: `Diagnosis Pohon Kakao ${inspection.blockId}`,
          });
        } catch (error: any) {
          console.warn("Gagal membagikan:", error);
        }
      }

      // Tampilkan Toast sukses tanpa memblokir dengan dialog konfirmasi
      const hasWebShare = typeof navigator !== "undefined" && !!(navigator as any).share;
      triggerToast(
        Platform.OS === "web" && !hasWebShare
          ? "Diagnosis disalin ke clipboard!"
          : "Diagnosis berhasil dibagikan!"
      );
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Toast Notifikasi Kustom (Premium & Non-blocking) */}
      {toast.visible && (
        <View style={styles.toastContainer}>
          <View
            style={[
              styles.toastContent,
              toast.type === "success" ? styles.toastSuccess : styles.toastInfo,
            ]}
          >
            <Ionicons
              name={toast.type === "success" ? "checkmark-circle" : "information-circle"}
              size={18}
              color={Colors.white}
            />
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        </View>
      )}

      {/* Top nav */}
      <View style={styles.navBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={Colors.gray800} />
        </Pressable>
        <Text style={styles.navTitle}>Hasil Analisis</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Foto hasil kamera + GradCAM overlay (simulasi visual heatmap) */}
        <View style={styles.imagePreview}>
          {inspection.photoUri ? (
            <Image
              source={{ uri: inspection.photoUri }}
              style={styles.photoImage}
              resizeMode="cover"
            />
          ) : (
            <>
              {!isHealthy && (
                <>
                  <View style={styles.gradcamBlobOuter} />
                  <View style={styles.gradcamBlobInner} />
                </>
              )}
              <Ionicons
                name="image-outline"
                size={28}
                color="rgba(255,255,255,0.3)"
                style={{ position: "absolute" }}
              />
              <Text style={styles.imagePlaceholderText}>
                {isHealthy ? "Foto tanaman" : "Foto + GradCAM overlay"}
              </Text>
            </>
          )}
          {/* Overlay GradCAM tetap ditampilkan di atas foto asli untuk kasus terdeteksi sakit */}
          {inspection.photoUri && !isHealthy && (
            <>
              <View style={styles.gradcamBlobOuter} />
              <View style={styles.gradcamBlobInner} />
              <View style={styles.gradcamLabel}>
                <Text style={styles.gradcamLabelText}>GradCAM overlay</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.content}>
          {/* Result card */}
          <View
            style={[
              styles.resultCard,
              { backgroundColor: isHealthy ? Colors.greenBg : Colors.redBg },
            ]}
          >
            <View style={styles.resultHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.resultName,
                    { color: isHealthy ? Colors.greenDarkText : Colors.redDark },
                  ]}
                >
                  {inspection.disease ?? "Sehat"}
                </Text>
                {inspection.scientificName && (
                  <Text style={styles.resultScientific}>
                    {inspection.scientificName}
                  </Text>
                )}
                <Text style={styles.resultMeta}>
                  {inspection.blockId} · {ORGAN_LABEL[inspection.organ]}
                </Text>
              </View>
              <View style={styles.confidenceBox}>
                <Text
                  style={[
                    styles.confidenceValue,
                    { color: isHealthy ? Colors.greenDarkText : Colors.redDark },
                  ]}
                >
                  {inspection.confidence.toFixed(1)}%
                </Text>
                <Text style={styles.confidenceLabel}>Confidence</Text>
              </View>
            </View>

            {severityConfig && (
              <View style={styles.severityRow}>
                <Text style={styles.severityLabel}>Keparahan:</Text>
                <View style={styles.pipsRow}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <View
                      key={i}
                      style={[
                        styles.pip,
                        {
                          backgroundColor:
                            i <= severityConfig.pips ? severityConfig.color : Colors.gray200,
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.severityText, { color: severityConfig.color }]}>
                  {severityConfig.label}
                </Text>
              </View>
            )}
          </View>

          {/* Rekomendasi */}
          <Text style={styles.sectionLabel}>Rekomendasi Tindakan</Text>
          <View style={styles.recommendationBox}>
            {inspection.recommendation.map((rec, idx) => (
              <Text key={idx} style={styles.recommendationLine}>
                {idx + 1}. {rec}
              </Text>
            ))}
          </View>

          {/* Metadata */}
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={Colors.gray500} />
            <Text style={styles.metaText}>
              {inspection.latitude.toFixed(4)}, {inspection.longitude.toFixed(4)}
            </Text>
            <View style={styles.metaDivider} />
            <Ionicons name="time-outline" size={14} color={Colors.gray500} />
            <Text style={styles.metaText}>
              {formatRelativeTimestamp(new Date(inspection.date))}
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actionRow}>
            <Pressable
              style={[styles.btnOutline, (isSaving || isSharing) && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={isSaving || isSharing}
            >
              <Text style={styles.btnOutlineText}>
                {isSaving ? "Menyimpan..." : "Simpan"}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.btnPrimary, (isSaving || isSharing) && { opacity: 0.6 }]}
              onPress={handleShare}
              disabled={isSaving || isSharing}
            >
              <Text style={styles.btnPrimaryText}>
                {isSharing ? "Membagikan..." : "Bagikan"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.gray200,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: {
    fontSize: FontSize.lg,
    fontWeight: "600",
    color: Colors.gray900,
  },
  imagePreview: {
    height: 220,
    backgroundColor: "#1e1e1e",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  photoImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  gradcamLabel: {
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  gradcamLabelText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: "600",
  },
  imagePlaceholderText: {
    color: "rgba(255,255,255,0.35)",
    fontSize: FontSize.sm,
    marginTop: 40,
  },
  gradcamBlobOuter: {
    position: "absolute",
    width: 140,
    height: 110,
    borderRadius: 70,
    backgroundColor: "rgba(255,60,0,0.28)",
    left: "30%",
    top: "25%",
  },
  gradcamBlobInner: {
    position: "absolute",
    width: 70,
    height: 55,
    borderRadius: 35,
    backgroundColor: "rgba(255,210,0,0.4)",
    left: "38%",
    top: "32%",
  },
  content: {
    padding: Spacing.xl,
  },
  resultCard: {
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  resultHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  resultName: {
    fontSize: FontSize.xl,
    fontWeight: "700",
  },
  resultScientific: {
    fontSize: FontSize.xs,
    color: Colors.gray600,
    fontStyle: "italic",
    marginTop: 2,
  },
  resultMeta: {
    fontSize: FontSize.xs,
    color: Colors.gray500,
    marginTop: 6,
  },
  confidenceBox: {
    alignItems: "flex-end",
  },
  confidenceValue: {
    fontSize: FontSize.xxl,
    fontWeight: "700",
  },
  confidenceLabel: {
    fontSize: FontSize.xs,
    color: Colors.gray500,
  },
  severityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(0,0,0,0.08)",
  },
  severityLabel: {
    fontSize: FontSize.xs,
    color: Colors.gray600,
  },
  pipsRow: {
    flexDirection: "row",
    gap: 3,
  },
  pip: {
    width: 18,
    height: 6,
    borderRadius: 3,
  },
  severityText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
  },
  sectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.gray900,
    marginBottom: Spacing.sm,
  },
  recommendationBox: {
    backgroundColor: "#FFF8E1",
    borderRadius: Radius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: 6,
  },
  recommendationLine: {
    fontSize: FontSize.sm,
    color: Colors.gray800,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: Spacing.xl,
  },
  metaText: {
    fontSize: FontSize.xs,
    color: Colors.gray500,
  },
  metaDivider: {
    width: 1,
    height: 12,
    backgroundColor: Colors.gray300,
    marginHorizontal: 4,
  },
  actionRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  btnOutline: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.gray300,
    alignItems: "center",
  },
  btnOutlineText: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.gray700,
  },
  btnPrimary: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.sm,
    backgroundColor: Colors.greenMain,
    alignItems: "center",
  },
  btnPrimaryText: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.white,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.gray600,
  },
  backLink: {
    fontSize: FontSize.md,
    color: Colors.greenMain,
    fontWeight: "600",
  },
  // --- Toast UI Styles ---
  toastContainer: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 9999,
    paddingHorizontal: Spacing.xl,
  },
  toastContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: Radius.full,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  toastSuccess: {
    backgroundColor: "rgba(46, 125, 50, 0.95)",
  },
  toastInfo: {
    backgroundColor: "rgba(25, 118, 210, 0.95)",
  },
  toastText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
});
