import React, { useMemo } from "react";
import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { FontSize, Radius, Spacing } from "@/constants/Theme";
import { Inspection } from "@/mocks/inspections";
import { TREES_BY_BLOCK, TreeEntry, TreeStatus } from "@/mocks/treeRegistry";
import { formatRelativeTimestamp } from "@/utils/time";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MAP_PADDING = Spacing.xl * 2;
const MAP_WIDTH = SCREEN_WIDTH - MAP_PADDING;
const GAP = 8; // jalan antar blok
const BLOCK_W = (MAP_WIDTH - GAP) / 2;
const BLOCK_H = 130;
const MAP_HEIGHT = BLOCK_H * 2 + GAP + 56; // 2 baris blok + gap + summary area

// Grid layout dalam blok: 4 kolom × 4 baris
const GRID_COLS = 4;
const GRID_ROWS = 4;
const DOT_INSET_X = 18;
const DOT_INSET_Y = 28; // ruang untuk label blok
const CELL_W = (BLOCK_W - DOT_INSET_X * 2) / (GRID_COLS - 1);
const CELL_H = (BLOCK_H - DOT_INSET_Y - 14) / (GRID_ROWS - 1);

interface SketchMapViewProps {
  inspections: Inspection[];
  selectedTreeCode: string | null;
  onTreeSelect: (tree: TreeEntry) => void;
}

// Pre-compute posisi blok di layout peta
const BLOCK_POSITIONS: Record<"A" | "B" | "C" | "D", { x: number; y: number }> = {
  A: { x: 0, y: 0 },
  B: { x: BLOCK_W + GAP, y: 0 },
  C: { x: 0, y: BLOCK_H + GAP },
  D: { x: BLOCK_W + GAP, y: BLOCK_H + GAP },
};

function statusColor(status: TreeStatus): string {
  switch (status) {
    case "kritis":
      return Colors.red;
    case "sedang":
      return Colors.orange;
    case "sehat":
      return Colors.greenAccent;
    default:
      return Colors.mapTree;
  }
}

function statusSymbol(status: TreeStatus): string {
  switch (status) {
    case "kritis":
      return "!";
    case "sedang":
      return "!";
    case "sehat":
      return "✓";
    default:
      return "";
  }
}

/** Satu titik pohon, di-memo agar tidak re-render seluruh grid saat 1 marker berubah. */
const TreeDotMarker = React.memo(function TreeDotMarker({
  tree,
  blockX,
  blockY,
  isInspected,
  isSelected,
  onPress,
}: {
  tree: TreeEntry;
  blockX: number;
  blockY: number;
  isInspected: boolean;
  isSelected: boolean;
  onPress: () => void;
}) {
  const dotX = blockX + DOT_INSET_X + tree.gridCol * CELL_W;
  const dotY = blockY + DOT_INSET_Y + tree.gridRow * CELL_H;
  const color = statusColor(tree.status);
  const hasStatus = tree.status !== "belum-diperiksa";
  const size = isSelected ? 22 : hasStatus ? 18 : 10;
  const symbol = statusSymbol(tree.status);

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.treeDot,
        {
          left: dotX - size / 2,
          top: dotY - size / 2,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: hasStatus ? 1 : 0.3,
          borderWidth: hasStatus ? 2 : 0,
          borderColor: hasStatus ? Colors.white : "transparent",
        },
        isSelected && styles.treeDotSelected,
      ]}
      hitSlop={8}
    >
      {hasStatus && symbol !== "" && (
        <Text style={styles.dotSymbol}>{symbol}</Text>
      )}
    </Pressable>
  );
});

/** Kotak 1 blok kebun (A/B/C/D). */
function BlockBox({
  block,
  x,
  y,
}: {
  block: "A" | "B" | "C" | "D";
  x: number;
  y: number;
}) {
  return (
    <View
      style={[
        styles.blockBox,
        { left: x, top: y, width: BLOCK_W, height: BLOCK_H },
      ]}
    >
      <Text style={styles.blockLabel}>Blok {block}</Text>
    </View>
  );
}

export function SketchMapView({
  inspections,
  selectedTreeCode,
  onTreeSelect,
}: SketchMapViewProps) {
  // Build lookup: treeCode → inspection (untuk status terkini)
  const inspectionMap = useMemo(() => {
    const map = new Map<string, Inspection>();
    for (const insp of inspections) {
      // Simpan inspeksi terbaru per blockId
      const existing = map.get(insp.blockId);
      if (!existing || insp.date > existing.date) {
        map.set(insp.blockId, insp);
      }
    }
    return map;
  }, [inspections]);

  // Merge status inspeksi ke tree registry
  const treesWithStatus = useMemo(() => {
    const blocks: Record<"A" | "B" | "C" | "D", (TreeEntry & { inspected: boolean })[]> =
      { A: [], B: [], C: [], D: [] };

    for (const blockKey of ["A", "B", "C", "D"] as const) {
      blocks[blockKey] = TREES_BY_BLOCK[blockKey].map((tree) => {
        const insp = inspectionMap.get(tree.treeCode);
        if (insp) {
          return {
            ...tree,
            status: insp.status as TreeStatus,
            disease: insp.disease,
            lastInspectionDate: insp.date,
            inspected: true,
          };
        }
        return { ...tree, inspected: false };
      });
    }
    return blocks;
  }, [inspectionMap]);

  const handleDotPress = (tree: TreeEntry) => {
    onTreeSelect(tree);
  };

  return (
    <View style={styles.mapWrap}>
      {/* Background */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.mapBg }]} />

      {/* Jalan antar blok */}
      <View
        style={[
          styles.roadHorizontal,
          {
            top: BLOCK_H,
            width: MAP_WIDTH,
            height: GAP,
          },
        ]}
      />
      <View
        style={[
          styles.roadVertical,
          {
            left: BLOCK_W,
            height: BLOCK_H * 2 + GAP,
            width: GAP,
          },
        ]}
      />

      {/* 4 Blok */}
      {(["A", "B", "C", "D"] as const).map((block) => (
        <BlockBox
          key={block}
          block={block}
          x={BLOCK_POSITIONS[block].x}
          y={BLOCK_POSITIONS[block].y}
        />
      ))}

      {/* Titik-titik pohon */}
      {(["A", "B", "C", "D"] as const).map((blockKey) => {
        const bp = BLOCK_POSITIONS[blockKey];
        return treesWithStatus[blockKey].map((tree) => (
          <TreeDotMarker
            key={tree.treeCode}
            tree={tree}
            blockX={bp.x}
            blockY={bp.y}
            isInspected={tree.inspected}
            isSelected={selectedTreeCode === tree.treeCode}
            onPress={() => handleDotPress(tree)}
          />
        ));
      })}

      {/* Zoom buttons placeholder */}
      <View style={styles.zoomButtons}>
        <Pressable style={styles.zoomBtn}>
          <Text style={styles.zoomBtnText}>+</Text>
        </Pressable>
        <View style={styles.zoomDivider} />
        <Pressable style={styles.zoomBtn}>
          <Text style={styles.zoomBtnText}>−</Text>
        </Pressable>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <LegendRow color={Colors.red} label="Kritis" />
        <LegendRow color={Colors.orange} label="Sedang" />
        <LegendRow color={Colors.greenAccent} label="Sehat" />
      </View>

      {/* Location pin di tengah (dekoratif) */}
      <View style={styles.centerPin}>
        <Ionicons name="location" size={20} color={Colors.blue} />
      </View>
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
  roadHorizontal: {
    position: "absolute",
    backgroundColor: Colors.mapRoad,
    opacity: 0.45,
  },
  roadVertical: {
    position: "absolute",
    top: 0,
    backgroundColor: Colors.mapRoad,
    opacity: 0.45,
  },
  blockBox: {
    position: "absolute",
    backgroundColor: "rgba(232,240,228,0.7)",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  blockLabel: {
    position: "absolute",
    left: 8,
    top: 6,
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(0,0,0,0.3)",
  },
  treeDot: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  treeDotSelected: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  dotSymbol: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: "700",
  },
  zoomButtons: {
    position: "absolute",
    right: Spacing.sm,
    top: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: Colors.gray200,
    overflow: "hidden",
  },
  zoomBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  zoomBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray700,
  },
  zoomDivider: {
    height: 0.5,
    backgroundColor: Colors.gray200,
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
    top: 40,
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
    zIndex: 20,
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
  centerPin: {
    position: "absolute",
    left: MAP_WIDTH / 2 - 10,
    top: (BLOCK_H * 2 + GAP) / 2 - 10,
    zIndex: 5,
  },
});
