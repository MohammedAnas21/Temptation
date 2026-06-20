import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface Offer {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  code: string;
  color: string;
  accent: string;
}

interface Props {
  offer: Offer;
  onApply?: (code: string) => void;
}

export function OfferCard({ offer, onApply }: Props) {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: offer.color, borderColor: offer.accent + "44" }]}>
      <View style={[styles.accentLine, { backgroundColor: offer.accent }]} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: "#fff" }]}>{offer.title}</Text>
        <Text style={[styles.subtitle, { color: "rgba(255,255,255,0.75)" }]}>{offer.subtitle}</Text>
        <View style={styles.footer}>
          <View style={[styles.codePill, { borderColor: offer.accent }]}>
            <Feather name="tag" size={11} color={offer.accent} />
            <Text style={[styles.code, { color: offer.accent }]}>{offer.code}</Text>
          </View>
          <View style={styles.timeRow}>
            <Feather name="clock" size={11} color="rgba(255,255,255,0.5)" />
            <Text style={styles.time}>{offer.time}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 12,
    overflow: "hidden",
    flexDirection: "row",
  },
  accentLine: { width: 4, borderRadius: 4 },
  content: { flex: 1, padding: 14 },
  title: { fontSize: 15, fontWeight: "800", marginBottom: 4 },
  subtitle: { fontSize: 12, lineHeight: 17, marginBottom: 10 },
  footer: { gap: 6 },
  codePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  code: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  time: { fontSize: 10, color: "rgba(255,255,255,0.5)" },
});
