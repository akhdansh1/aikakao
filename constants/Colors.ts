/**
 * Palet warna AI Kakao — konsisten dengan mockup HTML (mobile & web).
 * Hijau sebagai primary color merepresentasikan konteks perkebunan.
 */

export const Colors = {
  // Primary greens
  greenDark: "#1B4D1E",
  greenMain: "#2E7D32",
  greenMid: "#388E3C",
  greenLight: "#E8F5E9",
  greenAccent: "#66BB6A",

  // Status colors
  red: "#EF5350",
  redBg: "#FFEBEE",
  redDark: "#C62828",
  redText: "#E57373",

  orange: "#FFA726",
  orangeBg: "#FFF3E0",
  orangeDark: "#E65100",

  green: "#66BB6A",
  greenBg: "#E8F5E9",
  greenDarkText: "#2E7D32",

  blue: "#1565C0",
  blueBg: "#E3F2FD",

  // Neutrals
  white: "#FFFFFF",
  gray50: "#FAFAFA",
  gray100: "#F5F5F5",
  gray200: "#EEEEEE",
  gray300: "#E0E0E0",
  gray400: "#BDBDBD",
  gray500: "#9E9E9E",
  gray600: "#757575",
  gray700: "#616161",
  gray800: "#424242",
  gray900: "#212121",

  black: "#111111",

  // Map specific
  mapBg: "#E8F0E4",
  mapRoad: "#C5B99A",
  mapTree: "#5A9E50",
};

export const Severity = {
  tinggi: { label: "Tinggi", color: Colors.red, pips: 3 },
  sedang: { label: "Sedang", color: Colors.orange, pips: 2 },
  rendah: { label: "Rendah", color: Colors.greenAccent, pips: 1 },
};

export const StatusBadge = {
  kritis: { label: "Kritis", bg: Colors.redBg, text: Colors.redDark },
  sedang: { label: "Sedang", bg: Colors.orangeBg, text: Colors.orangeDark },
  sehat: { label: "Sehat", bg: Colors.greenBg, text: Colors.greenDarkText },
};

export default Colors;
