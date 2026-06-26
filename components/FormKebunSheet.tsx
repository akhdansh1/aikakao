import React, { useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, TextInput, Pressable,
  Modal, Animated, KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { FontSize, Radius, Spacing } from "@/constants/Theme";
import { useFormKebunStore, FormKebun } from "@/store/useFormKebunStore";

const ORGANS: { key: FormKebun["organTarget"]; label: string }[] = [
  { key: "batang", label: "Batang" },
  { key: "daun", label: "Daun" },
  { key: "buah", label: "Buah" },
];

interface Props {
  onConfirm: () => void;
}

export function FormKebunSheet({ onConfirm }: Props) {
  const { form, isSheetVisible, hideSheet, updateForm } = useFormKebunStore();
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (isSheetVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isSheetVisible]);

  const isValid =
    form.namaOperator.trim() !== "" &&
    form.namaKebun.trim() !== "" &&
    form.blok.trim() !== "" &&
    form.nomorPohon.trim() !== "";

  const handleConfirm = () => {
    if (!isValid) return;
    hideSheet();
    onConfirm();
  };

  return (
    <Modal
      visible={isSheetVisible}
      transparent
      animationType="fade"
      onRequestClose={hideSheet}
    >
      <KeyboardAvoidingView
        style={s.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable style={s.backdrop} onPress={hideSheet} />

        <Animated.View style={[s.sheet, { transform: [{ translateY: slideAnim }] }]}>
          {/* Handle bar */}
          <View style={s.handleBar} />

          {/* Header */}
          <View style={s.header}>
            <Text style={s.title}>Detail Kebun</Text>
            <Pressable onPress={hideSheet} style={s.closeBtn}>
              <Ionicons name="close" size={20} color={Colors.gray600} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Nama Operator */}
            <Text style={s.label}>Nama Operator <Text style={s.required}>*</Text></Text>
            <TextInput
              style={s.input}
              placeholder="Contoh: Pak Ahmad"
              placeholderTextColor={Colors.gray400}
              value={form.namaOperator}
              onChangeText={(v) => updateForm({ namaOperator: v })}
            />

            {/* Nama Kebun */}
            <Text style={s.label}>Nama Kebun <Text style={s.required}>*</Text></Text>
            <TextInput
              style={s.input}
              placeholder="Contoh: Kebun Utara"
              placeholderTextColor={Colors.gray400}
              value={form.namaKebun}
              onChangeText={(v) => updateForm({ namaKebun: v })}
            />

            {/* Blok */}
            <Text style={s.label}>Blok / Grid <Text style={s.required}>*</Text></Text>
            <TextInput
              style={s.input}
              placeholder="Contoh: A7"
              placeholderTextColor={Colors.gray400}
              value={form.blok}
              onChangeText={(v) => updateForm({ blok: v.toUpperCase() })}
              autoCapitalize="characters"
            />

            {/* Nomor Pohon */}
            <Text style={s.label}>Nomor Pohon <Text style={s.required}>*</Text></Text>
            <TextInput
              style={s.input}
              placeholder="Contoh: 042"
              placeholderTextColor={Colors.gray400}
              value={form.nomorPohon}
              onChangeText={(v) => updateForm({ nomorPohon: v.replace(/[^0-9]/g, "") })}
              keyboardType="numeric"
            />

            {/* Organ Target */}
            <Text style={s.label}>Organ Target</Text>
            <View style={s.organRow}>
              {ORGANS.map((o) => (
                <Pressable
                  key={o.key}
                  style={[s.organBtn, form.organTarget === o.key && s.organBtnActive]}
                  onPress={() => updateForm({ organTarget: o.key })}
                >
                  <Text style={[s.organText, form.organTarget === o.key && s.organTextActive]}>
                    {o.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Tombol Konfirmasi */}
            <Pressable
              style={[s.confirmBtn, !isValid && s.confirmBtnDisabled]}
              onPress={handleConfirm}
              disabled={!isValid}
            >
              <Ionicons name="camera" size={18} color={Colors.white} />
              <Text style={s.confirmText}>Mulai Scan</Text>
            </Pressable>

            <Text style={s.hint}>
              * Data tersimpan otomatis untuk scan berikutnya
            </Text>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.xl,
    paddingBottom: 36,
    maxHeight: "90%",
  },
  handleBar: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.gray300,
    alignSelf: "center", marginTop: 12, marginBottom: 8,
  },
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingVertical: Spacing.md,
  },
  title: { fontSize: FontSize.lg, fontWeight: "700", color: Colors.gray900 },
  closeBtn: { padding: 4 },
  label: {
    fontSize: FontSize.sm, fontWeight: "600",
    color: Colors.gray700, marginBottom: 6, marginTop: Spacing.md,
  },
  required: { color: Colors.red },
  input: {
    borderWidth: 1.5, borderColor: Colors.gray200,
    borderRadius: Radius.sm, paddingHorizontal: Spacing.md,
    paddingVertical: 10, fontSize: FontSize.sm,
    color: Colors.gray900, backgroundColor: Colors.gray50,
  },
  organRow: { flexDirection: "row", gap: Spacing.sm },
  organBtn: {
    flex: 1, paddingVertical: 10, borderRadius: Radius.sm,
    borderWidth: 1.5, borderColor: Colors.gray300, alignItems: "center",
  },
  organBtnActive: { borderColor: Colors.greenMain, backgroundColor: Colors.greenLight },
  organText: { fontSize: FontSize.sm, color: Colors.gray600 },
  organTextActive: { color: Colors.greenMain, fontWeight: "700" },
  confirmBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: Spacing.sm, backgroundColor: Colors.greenMain,
    paddingVertical: 14, borderRadius: Radius.md, marginTop: Spacing.xl,
  },
  confirmBtnDisabled: { backgroundColor: Colors.gray300 },
  confirmText: { color: Colors.white, fontSize: FontSize.md, fontWeight: "700" },
  hint: {
    fontSize: FontSize.xs, color: Colors.gray400,
    textAlign: "center", marginTop: Spacing.md,
  },
});