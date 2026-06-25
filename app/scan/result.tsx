import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Severity } from "@/constants/Colors";
import { FontSize, Radius, Spacing } from "@/constants/Theme";
import { useInspectionStore } from "@/store/useInspectionStore";
import { formatRelativeTimestamp } from "@/utils/time";

const ORGAN_LABEL: Record<string, string> = {
  batang: "Batang",
  daun: "Daun",
  buah: "Buah",
};

export default function ResultScreen() {
  const inspection = useInspectionStore((s) => s.selectedInspection);

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

  const handleSave = () => {
    Alert.alert("Tersimpan", `Hasil inspeksi ${inspection.blockId} telah disimpan.`);
  };

  const handleShare = () => {
    Alert.alert("Bagikan", "Fitur bagikan akan terhubung ke sistem sharing perangkat.");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
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
            <Pressable style={styles.btnOutline} onPress={handleSave}>
              <Text style={styles.btnOutlineText}>Simpan</Text>
            </Pressable>
            <Pressable style={styles.btnPrimary} onPress={handleShare}>
              <Text style={styles.btnPrimaryText}>Bagikan</Text>
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
});
