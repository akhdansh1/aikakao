import React from "react";
import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import { Colors } from "@/constants/Colors";
import { FontSize, Radius, Spacing } from "@/constants/Theme";
import { Inspection } from "@/mocks/inspections";
import { formatRelativeTimestamp } from "@/utils/time";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MAP_WIDTH = SCREEN_WIDTH - Spacing.xl * 2;
const MAP_HEIGHT = 320;

// Ukuran 1 kotak grid kecil dalam pixel layar, merepresentasikan 1 meter
// pada skala 1:100. Grid digambar memakai border View berulang (bukan SVG),
// supaya layar Peta tidak bergantung pada modul native sama sekali.
const GRID_CELL_PX = 20;

// Posisi marker di kanvas sketsa (kalibrasi manual relatif terhadap blok A-D).
// Mode ini adalah denah skematik untuk dokumentasi/presentasi teknis,
// bukan proyeksi GPS sungguhan.
const MARKER_POSITIONS: Record<string, { x: number; y: number }> = {
  "BLK-A7-042": { x: 0.2, y: 0.28 },
  "BLK-A7-041": { x: 0.24, y: 0.22 },
  "BLK-A5-018": { x: 0.12, y: 0.18 },
  "BLK-A5-003": { x: 0.16, y: 0.62 },
  "BLK-B2-007": { x: 0.68, y: 0.58 },
  "BLK-D1-011": { x: 0.78, y: 0.72 },
  "BLK-B3-014": { x: 0.74, y: 0.3 },
  "BLK-C1-022": { x: 0.42, y: 0.7 },
};

interface SketchMapViewProps {
  inspections: Inspection[];
  selectedMarker: Inspection | null;
  onMarkerPress: (inspection: Inspection) => void;
  onViewDetail: () => void;
}

function statusColor(status: Inspection["status"]) {
  if (status === "kritis") return Colors.red;
  if (status === "sedang") return Colors.orange;
  return Colors.greenAccent;
}

/** Grid garis vertikal & horizontal memakai View tipis, ulang sebanyak kebutuhan lebar/tinggi kanvas. */
function GridOverlay() {
  const cols = Math.ceil(MAP_WIDTH / GRID_CELL_PX);
  const rows = Math.ceil(MAP_HEIGHT / GRID_CELL_PX);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: cols + 1 }).map((_, i) => {
        const isMajor = i % 5 === 0; // garis tebal tiap 5 meter
        return (
          <View
            key={`col-${i}`}
            style={[
              styles.gridLineVertical,
              {
                left: i * GRID_CELL_PX,
                backgroundColor: isMajor ? "rgba(0,0,0,0.16)" : "rgba(0,0,0,0.06)",
                width: isMajor ? 1.2 : 0.6,
              },
            ]}
          />
        );
      })}
      {Array.from({ length: rows + 1 }).map((_, i) => {
        const isMajor = i % 5 === 0;
        return (
          <View
            key={`row-${i}`}
            style={[
              styles.gridLineHorizontal,
              {
                top: i * GRID_CELL_PX,
                backgroundColor: isMajor ? "rgba(0,0,0,0.16)" : "rgba(0,0,0,0.06)",
                height: isMajor ? 1.2 : 0.6,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

/** Titik-titik pohon dekoratif, ditata dalam grid sederhana. */
function TreeDots() {
  const dots: { x: number; y: number }[] = [];
  const cols = 7;
  const rows = 4;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push({
        x: 40 + c * (MAP_WIDTH / 8.4),
        y: 50 + r * 60,
      });
    }
  }
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {dots.map((d, idx) => (
        <View
          key={`tree-${idx}`}
          style={[styles.treeDot, { left: d.x - 5, top: d.y - 5 }]}
        />
      ))}
    </View>
  );
}

export function SketchMapView({
  inspections,
  selectedMarker,
  onMarkerPress,
  onViewDetail,
}: SketchMapViewProps) {
  return (
    <View style={styles.mapWrap}>
      {/* Background dasar */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.mapBg }]} />

      {/* Grid skala 1:100 */}
      <GridOverlay />

      {/* Jalan/path utama (digambar sebagai View sederhana, dekoratif) */}
      <View
        style={[
          styles.roadHorizontal,
          { top: MAP_HEIGHT * 0.48, width: MAP_WIDTH },
        ]}
      />
      <View
        style={[
          styles.roadVertical,
          { left: MAP_WIDTH * 0.5, height: MAP_HEIGHT },
        ]}
      />

      {/* Label blok */}
      <Text style={[styles.blockLabel, { left: 16, top: 8 }]}>Blok A</Text>
      <Text style={[styles.blockLabel, { left: MAP_WIDTH * 0.55, top: 8 }]}>
        Blok B
      </Text>
      <Text style={[styles.blockLabel, { left: 16, top: MAP_HEIGHT * 0.55 }]}>
        Blok C
      </Text>
      <Text
        style={[styles.blockLabel, { left: MAP_WIDTH * 0.55, top: MAP_HEIGHT * 0.55 }]}
      >
        Blok D
      </Text>

      {/* Titik pohon dekoratif */}
      <TreeDots />

      {/* Markers */}
      {inspections.map((inspection) => {
        const pos = MARKER_POSITIONS[inspection.blockId];
        if (!pos) return null;
        const isSelected = selectedMarker?.id === inspection.id;
        const color = statusColor(inspection.status);
        const isHealthy = inspection.status === "sehat";

        return (
          <Pressable
            key={inspection.id}
            onPress={() => onMarkerPress(inspection)}
            style={[
              styles.marker,
              {
                left: pos.x * MAP_WIDTH,
                top: pos.y * MAP_HEIGHT,
                backgroundColor: color,
                width: isSelected ? 26 : 20,
                height: isSelected ? 26 : 20,
                borderRadius: isSelected ? 13 : 10,
              },
            ]}
          >
            <Text style={styles.markerText}>{isHealthy ? "✓" : "!"}</Text>
          </Pressable>
        );
      })}

      {/* Scale indicator 1:100 */}
      <View style={styles.scaleBox}>
        <Text style={styles.scaleTitle}>Skala 1:100</Text>
        <View style={styles.scaleBarRow}>
          <View style={styles.scaleBarBlack} />
          <View style={styles.scaleBarWhite} />
        </View>
        <View style={styles.scaleLabelsRow}>
          <Text style={styles.scaleLabelText}>0</Text>
          <Text style={styles.scaleLabelText}>5 m</Text>
          <Text style={styles.scaleLabelText}>10 m</Text>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <LegendRow color={Colors.red} label="Kritis" />
        <LegendRow color={Colors.orange} label="Sedang" />
        <LegendRow color={Colors.greenAccent} label="Sehat" />
      </View>

      {/* Popup info marker terpilih */}
      {selectedMarker && (
        <Pressable style={styles.popup} onPress={onViewDetail}>
          <Text
            style={[styles.popupTitle, { color: statusColor(selectedMarker.status) }]}
          >
            ● {selectedMarker.blockId}
          </Text>
          <Text style={styles.popupSub}>
            {selectedMarker.disease ?? "Sehat"} · {selectedMarker.confidence.toFixed(1)}%
          </Text>
          <Text style={styles.popupMeta}>
            {formatRelativeTimestamp(new Date(selectedMarker.date))} · Ketuk untuk detail
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendRow}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mapWrap: {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    borderRadius: Radius.md,
    overflow: "hidden",
    position: "relative",
    backgroundColor: Colors.mapBg,
  },
  gridLineVertical: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 0.6,
  },
  gridLineHorizontal: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 0.6,
  },
  roadHorizontal: {
    position: "absolute",
    height: 7,
    backgroundColor: Colors.mapRoad,
    opacity: 0.55,
    borderRadius: 4,
  },
  roadVertical: {
    position: "absolute",
    width: 6,
    backgroundColor: Colors.mapRoad,
    opacity: 0.5,
    borderRadius: 3,
  },
  blockLabel: {
    position: "absolute",
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(0,0,0,0.3)",
  },
  treeDot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.mapTree,
    opacity: 0.28,
  },
  marker: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  markerText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: "700",
  },
  scaleBox: {
    position: "absolute",
    left: Spacing.sm,
    top: Spacing.sm,
    backgroundColor: "rgba(255,255,255,0.93)",
    borderRadius: 8,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderWidth: 0.5,
    borderColor: Colors.gray300,
  },
  scaleTitle: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.gray800,
    marginBottom: 3,
  },
  scaleBarRow: {
    flexDirection: "row",
  },
  scaleBarBlack: {
    width: 30,
    height: 4,
    backgroundColor: Colors.gray900,
  },
  scaleBarWhite: {
    width: 30,
    height: 4,
    backgroundColor: Colors.white,
    borderWidth: 0.5,
    borderColor: Colors.gray900,
  },
  scaleLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 60,
    marginTop: 2,
  },
  scaleLabelText: {
    fontSize: 8,
    color: Colors.gray600,
  },
  legend: {
    position: "absolute",
    left: Spacing.sm,
    bottom: Spacing.sm,
    backgroundColor: "rgba(255,255,255,0.93)",
    borderRadius: 8,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderWidth: 0.5,
    borderColor: Colors.gray300,
    gap: 4,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  legendText: {
    fontSize: FontSize.xs,
    color: Colors.gray700,
  },
  popup: {
    position: "absolute",
    right: Spacing.sm,
    top: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderWidth: 0.5,
    borderColor: Colors.gray200,
    minWidth: 150,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  popupTitle: {
    fontSize: FontSize.sm,
    fontWeight: "700",
  },
  popupSub: {
    fontSize: FontSize.xs,
    color: Colors.gray600,
    marginTop: 2,
  },
  popupMeta: {
    fontSize: 10,
    color: Colors.greenMain,
    marginTop: 3,
    fontWeight: "500",
  },
});
