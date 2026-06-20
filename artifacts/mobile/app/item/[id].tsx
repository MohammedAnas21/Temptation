import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCart } from "@/contexts/CartContext";
import { useUser } from "@/contexts/UserContext";
import { menuItems } from "@/constants/menu";
import { useColors } from "@/hooks/useColors";

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addItem, items, updateQuantity } = useCart();
  const { toggleFavorite, isFavorite } = useUser();
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  const item = menuItems.find((m) => m.id === id);
  const cartItem = items.find((i) => i.id === id);
  const qty = cartItem?.quantity ?? 0;
  const fav = item ? isFavorite(item.id) : false;

  const topPad = Platform.OS === "web" ? 60 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (!item) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFoundText, { color: colors.foreground }]}>Item not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.backText, { color: colors.gold }]}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const addOnTotal = selectedAddOns.reduce((sum, name) => {
    const ao = item.addOns?.find((a) => a.name === name);
    return sum + (ao?.price ?? 0);
  }, 0);

  const toggleAddOn = (name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedAddOns((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleAddToCart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addItem(item);
  };

  const starRating = item.rating ?? 4.5;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.heroImage} resizeMode="cover" />
        <View style={styles.imageGrad} />
        <View style={[styles.imageTopBar, { paddingTop: topPad + 8 }]}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.iconBtn, { backgroundColor: "rgba(7,15,12,0.7)" }]}
          >
            <Feather name="arrow-left" size={20} color="#fff" />
          </Pressable>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); item && toggleFavorite(item.id); }}
            style={[styles.iconBtn, { backgroundColor: "rgba(7,15,12,0.7)" }]}
          >
            <Feather name="heart" size={20} color={fav ? "#E53935" : "#fff"} />
          </Pressable>
        </View>
        {item.badge && (
          <View style={[styles.heroBadge, { backgroundColor: colors.gold }]}>
            <Text style={styles.heroBadgeText}>{item.badge}</Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: bottomPad + 110 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.foreground }]}>{item.name}</Text>
            {item.isVeg && (
              <View style={[styles.vegDot, { borderColor: "#4CAF50" }]}>
                <View style={styles.vegInner} />
              </View>
            )}
          </View>

          <View style={styles.metaRow}>
            <View style={[styles.ratingPill, { backgroundColor: colors.goldDim, borderColor: colors.gold + "33" }]}>
              <Feather name="star" size={13} color={colors.gold} />
              <Text style={[styles.ratingText, { color: colors.gold }]}>{starRating.toFixed(1)}</Text>
            </View>
            <View style={[styles.metaChip, { backgroundColor: colors.emeraldDim }]}>
              <Feather name="zap" size={13} color={colors.emeraldLight} />
              <Text style={[styles.metaChipText, { color: colors.emeraldLight }]}>{item.calories} kcal</Text>
            </View>
            <View style={[styles.metaChip, { backgroundColor: colors.surface }]}>
              <Feather name="clock" size={13} color={colors.mutedForeground} />
              <Text style={[styles.metaChipText, { color: colors.mutedForeground }]}>15-20 min</Text>
            </View>
          </View>

          <Text style={[styles.description, { color: colors.mutedForeground }]}>{item.description}</Text>

          {item.addOns && item.addOns.length > 0 && (
            <View style={styles.addOnsSection}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Customise</Text>
              <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>Add extras to your order</Text>
              {item.addOns.map((ao) => {
                const selected = selectedAddOns.includes(ao.name);
                return (
                  <Pressable
                    key={ao.name}
                    onPress={() => toggleAddOn(ao.name)}
                    style={[
                      styles.addOnRow,
                      {
                        backgroundColor: selected ? colors.goldDim : colors.card,
                        borderColor: selected ? colors.gold : colors.border,
                      },
                    ]}
                  >
                    <View style={[styles.addOnCheck, { borderColor: selected ? colors.gold : colors.border, backgroundColor: selected ? colors.gold : "transparent" }]}>
                      {selected && <Feather name="check" size={12} color="#000" />}
                    </View>
                    <Text style={[styles.addOnName, { color: colors.foreground }]}>{ao.name}</Text>
                    {ao.price > 0 && (
                      <Text style={[styles.addOnPrice, { color: colors.gold }]}>+₹{ao.price}</Text>
                    )}
                    {ao.price === 0 && (
                      <Text style={[styles.addOnPrice, { color: colors.mutedForeground }]}>Free</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}

          <View style={[styles.nutritionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Nutrition Info</Text>
            <View style={styles.nutritionGrid}>
              {[
                { label: "Calories", val: `${item.calories}`, unit: "kcal" },
                { label: "Protein", val: "18–24", unit: "g" },
                { label: "Carbs", val: "32–48", unit: "g" },
                { label: "Fat", val: "12–18", unit: "g" },
              ].map((n) => (
                <View key={n.label} style={[styles.nutritionItem, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.nutritionVal, { color: colors.gold }]}>{n.val}</Text>
                  <Text style={[styles.nutritionUnit, { color: colors.mutedForeground }]}>{n.unit}</Text>
                  <Text style={[styles.nutritionLabel, { color: colors.mutedForeground }]}>{n.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: bottomPad + 12, backgroundColor: colors.background }]}>
        <View style={styles.priceWrap}>
          <Text style={[styles.priceLabel, { color: colors.mutedForeground }]}>Total Price</Text>
          <Text style={[styles.price, { color: colors.gold }]}>₹{item.price + addOnTotal}</Text>
        </View>
        {qty > 0 ? (
          <View style={styles.qtyGroup}>
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); updateQuantity(item.id, qty - 1); }}
              style={[styles.qtyBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
            >
              <Feather name="minus" size={18} color={colors.foreground} />
            </Pressable>
            <Text style={[styles.qtyNum, { color: colors.foreground }]}>{qty}</Text>
            <Pressable
              onPress={handleAddToCart}
              style={[styles.qtyBtn, { borderColor: colors.gold, backgroundColor: colors.goldDim }]}
            >
              <Feather name="plus" size={18} color={colors.gold} />
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={handleAddToCart}
            style={[styles.addToCartBtn, { backgroundColor: colors.gold }]}
          >
            <Feather name="shopping-bag" size={18} color="#000" />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  notFound: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  notFoundText: { fontSize: 18 },
  backText: { fontSize: 16, fontWeight: "600" },
  imageContainer: { height: 300, position: "relative" },
  heroImage: { width: "100%", height: "100%" },
  imageGrad: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(7,15,12,0.35)",
  },
  imageTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  heroBadge: {
    position: "absolute",
    bottom: 16,
    left: 20,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  heroBadgeText: { fontSize: 12, fontWeight: "800", color: "#000" },
  scroll: { flex: 1 },
  content: { padding: 20 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  name: { fontSize: 26, fontWeight: "900", flex: 1, letterSpacing: -0.3 },
  vegDot: { width: 18, height: 18, borderRadius: 3, borderWidth: 2, justifyContent: "center", alignItems: "center" },
  vegInner: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#4CAF50" },
  metaRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  ratingPill: { flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  ratingText: { fontSize: 13, fontWeight: "700" },
  metaChip: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  metaChipText: { fontSize: 12, fontWeight: "600" },
  description: { fontSize: 14, lineHeight: 22, marginBottom: 24 },
  addOnsSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontWeight: "800", marginBottom: 4 },
  sectionSub: { fontSize: 12, marginBottom: 12 },
  addOnRow: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 8 },
  addOnCheck: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, justifyContent: "center", alignItems: "center" },
  addOnName: { flex: 1, fontSize: 14, fontWeight: "500" },
  addOnPrice: { fontSize: 14, fontWeight: "700" },
  nutritionCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 8 },
  nutritionGrid: { flexDirection: "row", gap: 8, marginTop: 12 },
  nutritionItem: { flex: 1, alignItems: "center", borderRadius: 10, padding: 12, gap: 2 },
  nutritionVal: { fontSize: 16, fontWeight: "800" },
  nutritionUnit: { fontSize: 10 },
  nutritionLabel: { fontSize: 10 },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  priceWrap: {},
  priceLabel: { fontSize: 12 },
  price: { fontSize: 26, fontWeight: "900" },
  qtyGroup: { flexDirection: "row", alignItems: "center", gap: 14 },
  qtyBtn: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  qtyNum: { fontSize: 20, fontWeight: "800", minWidth: 28, textAlign: "center" },
  addToCartBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 15,
  },
  addToCartText: { fontSize: 16, fontWeight: "800", color: "#000" },
});
