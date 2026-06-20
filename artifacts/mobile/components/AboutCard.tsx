import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AboutSection } from "@/constants/menu";
import fonts from "@/constants/fonts";
import { useColors } from "@/hooks/useColors";
import { useLayout } from "@/hooks/useLayout";

interface Props {
  sections: AboutSection[];
}

export function AboutCard({ sections }: Props) {
  const colors = useColors();
  const layout = useLayout();
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Pressable
        onPress={() => setExpanded(!expanded)}
        style={styles.header}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.iconWrap, { backgroundColor: colors.goldDim }]}>
            <Feather name="info" size={16} color={colors.gold} />
          </View>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>About this place</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {sections.length} categories
            </Text>
          </View>
        </View>
        <Feather name={expanded ? "chevron-up" : "chevron-down"} size={18} color={colors.mutedForeground} />
      </Pressable>

      {expanded && (
        <View style={styles.sections}>
          {sections.map((section, idx) => (
            <View key={section.title} style={[styles.section, idx < sections.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
              <View style={styles.sectionHeader}>
                <Feather name={section.icon as any} size={13} color={colors.gold} />
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{section.title}</Text>
              </View>
              <View style={styles.badges}>
                {section.items.map((item) => (
                  <View key={item} style={[styles.badge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 15, fontFamily: fonts.body[700] },
  subtitle: { fontSize: 11, fontFamily: fonts.body[400], marginTop: 1 },
  sections: { paddingHorizontal: 16, paddingBottom: 16, gap: 0 },
  section: { paddingVertical: 12 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  sectionTitle: { fontSize: 13, fontFamily: fonts.body[700] },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  badge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { fontSize: 11, fontFamily: fonts.body[400] },
});
