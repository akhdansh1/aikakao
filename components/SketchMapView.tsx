import React, { useMemo } from "react";
import { View, Text, StyleSheet, Pressable, useWindowDimensions } from "react-native";
import { Colors } from "@/constants/Colors";
import { FontSize, Radius, Spacing } from "@/constants/Theme";
import { Inspection } from "@/mocks/inspections";
import { formatRelativeTimestamp } from "@/utils/time";

const MAP_HEIGHT = 300;
const CELL = 20;       // 1 cell = 1 meter pada skala 1:100
const MAX_LINES = 80;  // batas keras supaya tidak render ratusan View

// Posisi marker dalam fraksi 0-1 dari lebar/tinggi peta
const POSITIONS: Record<string, { x: number; y: number }> = {
  "BLK-A7-042": { x: 0.20, y: 0.28 },
  "BLK-A7-041": { x: 0.24, y: 0.22 },
  "BLK-A5-018": { x: 0.12, y: 0.18 },
  "BLK-A5-003": { x: 0.16, y: 0.62 },
  "BLK-B2-007": { x: 0.68, y: 0.58 },
  "BLK-D1-011": { x: 0.78, y: 0.72 },
  "BLK-B3-014": { x: 0.74, y: 0.30 },
  "BLK-C1-022": { x: 0.42, y: 0.70 },
};

// Posisi pohon dalam fraksi (dihitung sekali di module level, aman)
const TREES = [
  {x:0.08,y:0.12},{x:0.18,y:0.08},{x:0.28,y:0.14},{x:0.38,y:0.10},
  {x:0.08,y:0.30},{x:0.18,y:0.26},{x:0.28,y:0.32},{x:0.38,y:0.28},
  {x:0.08,y:0.62},{x:0.18,y:0.66},{x:0.28,y:0.60},{x:0.38,y:0.64},
  {x:0.60,y:0.12},{x:0.70,y:0.08},{x:0.80,y:0.14},{x:0.90,y:0.10},
  {x:0.60,y:0.30},{x:0.70,y:0.26},{x:0.80,y:0.32},{x:0.90,y:0.28},
  {x:0.60,y:0.64},{x:0.70,y:0.68},{x:0.80,y:0.62},{x:0.90,y:0.66},
];

function markerColor(s: Inspection["status"]) {
  if (s === "kritis") return Colors.red;
  if (s === "sedang") return Colors.orange;
  return Colors.greenAccent;
}

interface Props {
  inspections: Inspection[];
  selectedMarker: Inspection | null;
  onMarkerPress: (i: Inspection) => void;
  onViewDetail: () => void;
}

export function SketchMapView({ inspections, selectedMarker, onMarkerPress, onViewDetail }: Props) {
  // useWindowDimensions = diambil saat runtime di device, bukan saat module eval
  const { width: screenW } = useWindowDimensions();
  const mapW = Math.max(200, screenW - Spacing.xl * 2);

  // Hitung jumlah grid lines sekali saja dengan useMemo + batas keras
  const { cols, rows } = useMemo(() => ({
    cols: Math.min(MAX_LINES, Math.ceil(mapW / CELL) + 1),
    rows: Math.min(MAX_LINES, Math.ceil(MAP_HEIGHT / CELL) + 1),
  }), [mapW]);

  return (
    <View style={[s.map, { width: mapW, height: MAP_HEIGHT }]}>
      {/* Grid vertikal */}
      {Array.from({ length: cols }, (_, i) => (
        <View key={`v${i}`} style={[s.gridV, {
          left: i * CELL,
          width: i % 5 === 0 ? 1 : 0.5,
          backgroundColor: i % 5 === 0 ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.05)",
        }]} />
      ))}

      {/* Grid horizontal */}
      {Array.from({ length: rows }, (_, i) => (
        <View key={`h${i}`} style={[s.gridH, {
          top: i * CELL,
          height: i % 5 === 0 ? 1 : 0.5,
          backgroundColor: i % 5 === 0 ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.05)",
        }]} />
      ))}

      {/* Jalan */}
      <View style={[s.road, { top: MAP_HEIGHT * 0.48, left: 0, right: 0, height: 6 }]} />
      <View style={[s.road, { left: mapW * 0.50, top: 0, bottom: 0, width: 5 }]} />

      {/* Label blok */}
      <Text style={[s.blk, { left: 10, top: 6 }]}>Blok A</Text>
      <Text style={[s.blk, { left: mapW * 0.55, top: 6 }]}>Blok B</Text>
      <Text style={[s.blk, { left: 10, top: MAP_HEIGHT * 0.55 }]}>Blok C</Text>
      <Text style={[s.blk, { left: mapW * 0.55, top: MAP_HEIGHT * 0.55 }]}>Blok D</Text>

      {/* Titik pohon */}
      {TREES.map((t, i) => (
        <View key={`t${i}`} style={[s.tree, { left: t.x * mapW - 5, top: t.y * MAP_HEIGHT - 5 }]} />
      ))}

      {/* Marker inspeksi */}
      {inspections.map((insp) => {
        const pos = POSITIONS[insp.blockId];
        if (!pos) return null;
        const sel = selectedMarker?.id === insp.id;
        const sz = sel ? 26 : 20;
        return (
          <Pressable key={insp.id} onPress={() => onMarkerPress(insp)}
            style={[s.marker, {
              left: pos.x * mapW - sz / 2,
              top: pos.y * MAP_HEIGHT - sz / 2,
              width: sz, height: sz, borderRadius: sz / 2,
              backgroundColor: markerColor(insp.status),
            }]}
          >
            <Text style={s.markerTxt}>{insp.status === "sehat" ? "✓" : "!"}</Text>
          </Pressable>
        );
      })}

      {/* Skala 1:100 */}
      <View style={s.scaleBox}>
        <Text style={s.scaleTitle}>Skala 1:100</Text>
        <View style={{ flexDirection: "row" }}>
          <View style={s.scaleBlack} />
          <View style={s.scaleWhite} />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", width: 56, marginTop: 2 }}>
          <Text style={s.scaleTxt}>0</Text>
          <Text style={s.scaleTxt}>5 m</Text>
          <Text style={s.scaleTxt}>10 m</Text>
        </View>
      </View>

      {/* Legenda */}
      <View style={s.legend}>
        {[
          { c: Colors.red, l: "Kritis" },
          { c: Colors.orange, l: "Sedang" },
          { c: Colors.greenAccent, l: "Sehat" },
        ].map((item) => (
          <View key={item.l} style={s.legRow}>
            <View style={[s.legDot, { backgroundColor: item.c }]} />
            <Text style={s.legTxt}>{item.l}</Text>
          </View>
        ))}
      </View>

      {/* Popup marker terpilih */}
      {selectedMarker && (
        <Pressable style={s.popup} onPress={onViewDetail}>
          <Text style={[s.popupTitle, { color: markerColor(selectedMarker.status) }]}>
            ● {selectedMarker.blockId}
          </Text>
          <Text style={s.popupSub}>
            {selectedMarker.disease ?? "Sehat"} · {selectedMarker.confidence.toFixed(1)}%
          </Text>
          <Text style={s.popupMeta}>
            {formatRelativeTimestamp(new Date(selectedMarker.date))} · Ketuk detail
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  map: { borderRadius: Radius.md, overflow: "hidden", backgroundColor: Colors.mapBg, position: "relative" },
  gridV: { position: "absolute", top: 0, bottom: 0 },
  gridH: { position: "absolute", left: 0, right: 0 },
  road: { position: "absolute", backgroundColor: Colors.mapRoad, opacity: 0.55, borderRadius: 3 },
  blk: { position: "absolute", fontSize: 10, fontWeight: "700", color: "rgba(0,0,0,0.28)" },
  tree: { position: "absolute", width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.mapTree, opacity: 0.28 },
  marker: { position: "absolute", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: Colors.white },
  markerTxt: { color: Colors.white, fontSize: 10, fontWeight: "700" },
  scaleBox: { position: "absolute", left: Spacing.sm, top: Spacing.sm, backgroundColor: "rgba(255,255,255,0.93)", borderRadius: 7, paddingHorizontal: Spacing.sm, paddingVertical: 5, borderWidth: 0.5, borderColor: Colors.gray300 },
  scaleTitle: { fontSize: 9, fontWeight: "700", color: Colors.gray800, marginBottom: 3 },
  scaleBlack: { width: 28, height: 4, backgroundColor: Colors.gray900 },
  scaleWhite: { width: 28, height: 4, backgroundColor: Colors.white, borderWidth: 0.5, borderColor: Colors.gray900 },
  scaleTxt: { fontSize: 7, color: Colors.gray600 },
  legend: { position: "absolute", left: Spacing.sm, bottom: Spacing.sm, backgroundColor: "rgba(255,255,255,0.93)", borderRadius: 7, paddingHorizontal: Spacing.sm, paddingVertical: 5, borderWidth: 0.5, borderColor: Colors.gray300, gap: 4 },
  legRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  legDot: { width: 8, height: 8, borderRadius: 4 },
  legTxt: { fontSize: FontSize.xs, color: Colors.gray700 },
  popup: { position: "absolute", right: Spacing.sm, top: Spacing.sm, backgroundColor: Colors.white, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm, borderWidth: 0.5, borderColor: Colors.gray200, minWidth: 140 },
  popupTitle: { fontSize: FontSize.sm, fontWeight: "700" },
  popupSub: { fontSize: FontSize.xs, color: Colors.gray600, marginTop: 2 },
  popupMeta: { fontSize: 9, color: Colors.greenMain, marginTop: 3, fontWeight: "500" },
});
