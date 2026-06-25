import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import { Colors } from "@/constants/Colors";
import { FontSize, Spacing } from "@/constants/Theme";

const MOTIVATIONS = [
  "Semangat bertugas hari ini!",
  "Jaga kesehatan tanaman kebun kita bersama.",
  "Setiap inspeksi yang kamu lakukan, melindungi panen kita.",
  "Kerja kerasmu menjaga kualitas kakao Berau!",
  "Teliti dan cermat — tanaman sehat, hasil melimpah.",
];

function greeting(h: number) {
  if (h >= 4 && h < 11) return "Selamat Pagi";
  if (h >= 11 && h < 15) return "Selamat Siang";
  if (h >= 15 && h < 19) return "Selamat Sore";
  return "Selamat Malam";
}

function fullDate(d: Date) {
  return d.toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function clockStr(d: Date) {
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

interface Props { operatorName?: string }

export function DashboardHeader({ operatorName = "Operator" }: Props) {
  const [now, setNow] = useState(new Date());
  const [locationText, setLocationText] = useState<string | null>(null);
  const [coords, setCoords] = useState<string | null>(null);
  const [locLoading, setLocLoading] = useState(true);

  // Jam realtime update tiap detik
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Fetch lokasi — ditunda 500ms agar tidak bersaing dengan startup
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;
        if (status !== "granted") {
          setLocationText("Izin lokasi belum diberikan");
          setLocLoading(false);
          return;
        }
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low, // Low = lebih cepat, hemat baterai
        });
        if (cancelled) return;
        const { latitude, longitude } = pos.coords;
        setCoords(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        try {
          const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
          if (cancelled) return;
          const label = [place.subregion ?? place.district, place.city ?? place.region]
            .filter(Boolean).join(", ");
          setLocationText(label || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } catch {
          setLocationText(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
      } catch {
        if (!cancelled) setLocationText("Lokasi tidak tersedia");
      } finally {
        if (!cancelled) setLocLoading(false);
      }
    }, 500);

    return () => { cancelled = true; clearTimeout(timer); };
  }, []);

  const h = now.getHours();
  const motivation = MOTIVATIONS[Math.floor(h / 4) % MOTIVATIONS.length];

  return (
    <View style={s.header}>
      <View style={s.topRow}>
        <View style={s.left}>
          <Text style={s.greetLabel}>{greeting(h)},</Text>
          <Text style={s.name}>{operatorName}</Text>
          <Text style={s.motivation}>{motivation}</Text>
        </View>
        <Text style={s.clock}>{clockStr(now)}</Text>
      </View>

      <View style={s.divider} />

      <View style={s.infoBlock}>
        <View style={s.infoRow}>
          <Text style={s.icon}>📅</Text>
          <Text style={s.infoText}>{fullDate(now)}</Text>
        </View>
        <View style={s.infoRow}>
          <Text style={s.icon}>📍</Text>
          {locLoading
            ? <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" />
            : <Text style={s.infoText} numberOfLines={2}>
                {locationText ?? "—"}
                {coords ? `\n${coords}` : ""}
              </Text>
          }
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    backgroundColor: Colors.greenMain,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  left: { flex: 1, marginRight: Spacing.sm },
  greetLabel: { color: "rgba(255,255,255,0.75)", fontSize: FontSize.sm },
  name: { color: Colors.white, fontSize: FontSize.xl, fontWeight: "700", marginTop: 1 },
  motivation: {
    color: "rgba(255,255,255,0.65)", fontSize: FontSize.xs,
    marginTop: 4, fontStyle: "italic", lineHeight: 16,
  },
  clock: {
    color: Colors.white, fontSize: 21, fontWeight: "700",
    letterSpacing: 0.5,
  },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.2)", marginVertical: Spacing.md },
  infoBlock: { gap: 6 },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  icon: { fontSize: 13, marginTop: 1 },
  infoText: { color: "rgba(255,255,255,0.85)", fontSize: FontSize.xs, flex: 1, lineHeight: 17 },
});
