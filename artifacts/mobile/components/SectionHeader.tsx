import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import fonts from "@/constants/fonts";
import { useColors } from "@/hooks/useColors";

interface Props {
  title: string;
  subtitle?: string;
  onSeeAll?: () => void;
}

export function SectionHeader({ title, subtitle, onSeeAll }: Props) {
  const colors = useColors();
  return (
    <View style={styles.container}>
      <View>
        <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>}
      </View>
      {onSeeAll && (
        <Pressable onPress={onSeeAll}>
          <Text style={[styles.seeAll, { color: colors.gold }]}>See All</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  title: { fontFamily: fonts.display[800], fontSize: 20, letterSpacing: -0.3 },
  subtitle: { fontFamily: fonts.body[400], fontSize: 12, marginTop: 2 },
  seeAll: { fontFamily: fonts.body[600], fontSize: 13 },
});
