import React, { useState, useMemo, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  Modal,
  Platform,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { FontSize, Radius, Spacing, Shadow } from "@/constants/Theme";
import { TREE_REGISTRY, TREES_BY_BLOCK, TreeEntry, TreeStatus } from "@/mocks/treeRegistry";

interface TreeSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (tree: TreeEntry) => void;
}

const STATUS_LABELS: Record<TreeStatus, string> = {
  kritis: "Kritis",
  sedang: "Sedang",
  sehat: "Sehat",
  "belum-diperiksa": "Belum diperiksa",
};

const STATUS_COLORS: Record<TreeStatus, { bg: string; text: string }> = {
  kritis: { bg: Colors.redBg, text: Colors.redDark },
  sedang: { bg: Colors.orangeBg, text: Colors.orangeDark },
  sehat: { bg: Colors.greenBg, text: Colors.greenDarkText },
  "belum-diperiksa": { bg: Colors.gray100, text: Colors.gray500 },
};

type BlockFilter = "semua" | "A" | "B" | "C" | "D";

const BLOCK_FILTERS: { key: BlockFilter; label: string }[] = [
  { key: "semua", label: "Semua" },
  { key: "A", label: "Blok A" },
  { key: "B", label: "Blok B" },
  { key: "C", label: "Blok C" },
  { key: "D", label: "Blok D" },
];

const ITEM_HEIGHT = 68;

/** Satu baris hasil pencarian pohon, di-memo supaya FlatList tidak
 *  re-render semua item saat query berubah. */
const TreeItem = React.memo(function TreeItem({
  tree,
  onPress,
}: {
  tree: TreeEntry;
  onPress: () => void;
}) {
  const sc = STATUS_COLORS[tree.status];
  return (
    <Pressable
      style={({ pressed }) => [
        styles.item,
        pressed && styles.itemPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.itemLeft}>
        <View style={styles.itemCodeRow}>
          <View style={styles.treeIconCircle}>
            <Ionicons name="leaf" size={12} color={Colors.white} />
          </View>
          <Text style={styles.itemCode}>{tree.treeCode}</Text>
        </View>
        <Text style={styles.itemMeta}>
          Blok {tree.block} · Baris {tree.row}
          {tree.disease ? ` · ${tree.disease}` : ""}
        </Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
        <Text style={[styles.statusText, { color: sc.text }]}>
          {STATUS_LABELS[tree.status]}
        </Text>
      </View>
    </Pressable>
  );
});

export function TreeSearchModal({ visible, onClose, onSelect }: TreeSearchModalProps) {
  const [query, setQuery] = useState("");
  const [blockFilter, setBlockFilter] = useState<BlockFilter>("semua");
  const inputRef = useRef<TextInput>(null);

  const filtered = useMemo(() => {
    // Pertama filter berdasarkan blok
    let source: TreeEntry[];
    if (blockFilter === "semua") {
      source = TREE_REGISTRY;
    } else {
      source = TREES_BY_BLOCK[blockFilter];
    }

    // Kemudian filter berdasarkan query teks
    if (!query.trim()) return source;
    const q = query.toLowerCase();
    return source.filter(
      (t) =>
        t.treeCode.toLowerCase().includes(q) ||
        `blok ${t.block}`.toLowerCase().includes(q) ||
        (t.disease ?? "").toLowerCase().includes(q)
    );
  }, [query, blockFilter]);

  const handleSelect = useCallback(
    (tree: TreeEntry) => {
      Keyboard.dismiss();
      onSelect(tree);
      setQuery("");
      setBlockFilter("semua");
    },
    [onSelect]
  );

  const renderItem = useCallback(
    ({ item }: { item: TreeEntry }) => (
      <TreeItem tree={item} onPress={() => handleSelect(item)} />
    ),
    [handleSelect]
  );

  const getItemLayout = useCallback(
    (_data: unknown, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  const keyExtractor = useCallback((item: TreeEntry) => item.treeCode, []);

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    setQuery("");
    setBlockFilter("semua");
    onClose();
  }, [onClose]);

  const handleBlockFilter = useCallback((block: BlockFilter) => {
    setBlockFilter(block);
    setQuery("");
  }, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <View style={styles.safeTop} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable onPress={handleClose} hitSlop={12} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={Colors.gray800} />
          </Pressable>
          <Text style={styles.title}>Pilih Kode Pohon</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={Colors.gray400} />
          <TextInput
            ref={inputRef}
            placeholder="Cari kode pohon, blok, penyakit..."
            placeholderTextColor={Colors.gray400}
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={Colors.gray400} />
            </Pressable>
          )}
        </View>

        {/* Block filter chips */}
        <View style={styles.blockFilterRow}>
          {BLOCK_FILTERS.map((bf) => (
            <Pressable
              key={bf.key}
              onPress={() => handleBlockFilter(bf.key)}
              style={[
                styles.blockChip,
                blockFilter === bf.key && styles.blockChipActive,
              ]}
            >
              <Text
                style={[
                  styles.blockChipText,
                  blockFilter === bf.key && styles.blockChipTextActive,
                ]}
              >
                {bf.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Count */}
        <Text style={styles.countLabel}>
          {filtered.length} pohon ditemukan
        </Text>

        {/* List — menggunakan flex: 1 supaya mengisi ruang yang tersisa
            dan keyboard tidak menutupi konten (FlatList akan menyusut) */}
        <FlatList
          data={filtered}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          initialNumToRender={12}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS === "android"}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="leaf-outline" size={36} color={Colors.gray300} />
              <Text style={styles.emptyText}>
                Tidak ada pohon ditemukan untuk "{query || blockFilter}"
              </Text>
            </View>
          }
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeTop: {
    backgroundColor: Colors.white,
    paddingTop: Platform.OS === "ios" ? 50 : 0,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.gray200,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.gray900,
    textAlign: "center",
  },
  headerSpacer: {
    width: 36, // sama dengan backButton supaya title tetap di tengah
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.gray100,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    height: 44,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.gray900,
    paddingVertical: 0, // penting untuk Android agar height konsisten
  },
  blockFilterRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  blockChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  blockChipActive: {
    backgroundColor: Colors.greenLight,
    borderColor: Colors.greenMain,
  },
  blockChipText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.gray600,
  },
  blockChipTextActive: {
    color: Colors.greenMain,
  },
  countLabel: {
    fontSize: FontSize.xs,
    color: Colors.gray500,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: Spacing.xxl,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    height: ITEM_HEIGHT,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.gray100,
  },
  itemPressed: {
    backgroundColor: Colors.gray50,
  },
  itemLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  itemCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  treeIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.greenMain,
    alignItems: "center",
    justifyContent: "center",
  },
  itemCode: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Colors.gray900,
  },
  itemMeta: {
    fontSize: FontSize.xs,
    color: Colors.gray500,
    marginTop: 3,
    marginLeft: 32,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingTop: Spacing.xxxl * 2,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.gray500,
    textAlign: "center",
    paddingHorizontal: Spacing.xxl,
  },
});
