import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MenuItemCard } from "@/components/MenuItemCard";
import { LogoBrand } from "@/components/LogoBrand";
import { useCart } from "@/contexts/CartContext";
import { categories, menuItems } from "@/constants/menu";
import { useColors } from "@/hooks/useColors";
import { useLayout } from "@/hooks/useLayout";

export default function MenuScreen() {
  const colors = useColors();
  const layout = useLayout();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { itemCount, total } = useCart();
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCat = activeCategory === "all" || item.category === activeCategory;
      const matchesSearch =
        search.trim() === "" ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [activeCategory, search]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const hp = layout.hp;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, paddingHorizontal: hp }]}>
        <LogoBrand variant="mini" />
        <Text style={[styles.title, { color: colors.foreground, fontSize: layout.fs(26) }]}>
          Our Menu
        </Text>
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground, fontSize: layout.fs(14) }]}
            placeholder="Search dishes..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Feather name="x" size={15} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        <FlatList
          data={categories}
          keyExtractor={(c) => c.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 0, paddingVertical: 12, gap: 8 }}
          renderItem={({ item: cat }) => {
            const active = cat.id === activeCategory;
            return (
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveCategory(cat.id);
                }}
                style={[
                  styles.catPill,
                  {
                    backgroundColor: active ? colors.gold : colors.card,
                    borderColor: active ? colors.gold : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.catText,
                    {
                      color: active ? "#000" : colors.mutedForeground,
                      fontWeight: active ? "700" : "500",
                      fontSize: layout.fs(13),
                    },
                  ]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="search" size={40} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground, fontSize: layout.fs(16) }]}>
            No items found
          </Text>
        </View>
      ) : (
        <FlatList
          key={layout.menuCols}
          data={filtered}
          keyExtractor={(i) => i.id}
          numColumns={layout.menuCols}
          columnWrapperStyle={[
            styles.row,
            layout.menuCols > 2 && { justifyContent: "flex-start" },
          ]}
          contentContainerStyle={[
            styles.list,
            {
              paddingHorizontal: hp,
              paddingBottom: itemCount > 0 ? 110 : Platform.OS === "web" ? 100 : 80,
            },
          ]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/item/${item.id}`)}
              style={{ marginBottom: layout.menuGap }}
            >
              <MenuItemCard item={item} cardWidth={layout.cardW} />
            </Pressable>
          )}
        />
      )}

      {itemCount > 0 && (
        <View
          style={[
            styles.cartBar,
            {
              backgroundColor: colors.gold,
              left: hp,
              right: hp,
              bottom: Platform.OS === "web" ? 34 : 16,
            },
          ]}
        >
          <View style={styles.cartBarLeft}>
            <View style={[styles.cartCount, { backgroundColor: "rgba(0,0,0,0.2)" }]}>
              <Text style={styles.cartCountText}>{itemCount}</Text>
            </View>
            <Text style={[styles.cartBarText, { fontSize: layout.fs(15) }]}>View Cart</Text>
          </View>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/(tabs)/orders");
            }}
            style={styles.cartBarRight}
          >
            <Text style={[styles.cartBarTotal, { fontSize: layout.fs(16) }]}>₹{total}</Text>
            <Feather name="arrow-right" size={18} color="#000" />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingBottom: 0 },
  title: { fontWeight: "900", letterSpacing: -0.5, marginBottom: 12 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: { flex: 1 },
  catPill: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 7 },
  catText: {},
  list: { paddingTop: 4 },
  row: { gap: 12, marginBottom: 0 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  emptyText: {},
  cartBar: {
    position: "absolute",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cartBarLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  cartCount: { width: 26, height: 26, borderRadius: 13, justifyContent: "center", alignItems: "center" },
  cartCountText: { fontSize: 12, fontWeight: "800", color: "#000" },
  cartBarText: { fontWeight: "700", color: "#000" },
  cartBarRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  cartBarTotal: { fontWeight: "800", color: "#000" },
});
