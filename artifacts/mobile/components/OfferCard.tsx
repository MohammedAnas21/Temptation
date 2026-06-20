import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import fonts from "@/constants/fonts";
import { useLayout } from "@/hooks/useLayout";

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

export function OfferCard({ offer }: Props) {
  const layout = useLayout();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: offer.color,
          borderColor: offer.accent + "44",
          width: layout.offerCardW,
        },
      ]}
    >
      <View style={[styles.accentLine, { backgroundColor: offer.accent }]} />
      <View style={styles.content}>
        <Text style={[styles.title, { fontSize: layout.fs(15) }]}>{offer.title}</Text>
        <Text style={[styles.subtitle, { fontSize: layout.fs(12) }]}>{offer.subtitle}</Text>
        <View style={styles.footer}>
          <View style={[styles.codePill, { borderColor: offer.accent }]}>
            <Feather name="tag" size={11} color={offer.accent} />
            <Text style={[styles.code, { color: offer.accent, fontSize: layout.fs(11) }]}>
              {offer.code}
            </Text>
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
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 12,
    overflow: "hidden",
    flexDirection: "row",
  },
  accentLine: { width: 4, borderRadius: 4 },
  content: { flex: 1, padding: 14 },
  title: { color: "#fff", fontFamily: fonts.display[800], marginBottom: 4 },
  subtitle: { color: "rgba(255,255,255,0.75)", fontFamily: fonts.body[400], lineHeight: 17, marginBottom: 10 },
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
  code: { fontFamily: fonts.mono[700], letterSpacing: 0.5 },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  time: { fontSize: 10, fontFamily: fonts.body[400], color: "rgba(255,255,255,0.5)" },
});
