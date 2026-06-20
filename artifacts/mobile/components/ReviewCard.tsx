import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  time: string;
}

export function ReviewCard({ review }: { review: Review }) {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.goldDim }]}>
          <Text style={[styles.avatarText, { color: colors.gold }]}>{review.name[0]}</Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.foreground }]}>{review.name}</Text>
          <View style={styles.stars}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Feather
                key={i}
                name="star"
                size={12}
                color={i < review.rating ? colors.gold : colors.border}
              />
            ))}
          </View>
        </View>
        <Text style={[styles.time, { color: colors.mutedForeground }]}>{review.time}</Text>
      </View>
      <Text style={[styles.text, { color: colors.mutedForeground }]}>{review.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 260,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginRight: 12,
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 10 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 16, fontWeight: "700" },
  info: { flex: 1 },
  name: { fontSize: 13, fontWeight: "700", marginBottom: 2 },
  stars: { flexDirection: "row", gap: 2 },
  time: { fontSize: 11 },
  text: { fontSize: 12, lineHeight: 18 },
});
