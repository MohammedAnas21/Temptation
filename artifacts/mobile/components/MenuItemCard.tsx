import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useCart } from "@/contexts/CartContext";
import { useUser } from "@/contexts/UserContext";
import { MenuItem } from "@/constants/menu";
import { useColors } from "@/hooks/useColors";

interface Props {
  item: MenuItem;
  horizontal?: boolean;
}

export function MenuItemCard({ item, horizontal = false }: Props) {
  const colors = useColors();
  const { addItem, items, updateQuantity } = useCart();
  const { toggleFavorite, isFavorite } = useUser();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const cartItem = items.find((i) => i.id === item.id);
  const qty = cartItem?.quantity ?? 0;
  const fav = isFavorite(item.id);

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const handleAdd = () => {
    animatePress();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addItem(item);
  };

  const handleFav = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite(item.id);
  };

  if (horizontal) {
    return (
      <Animated.View style={[styles.hCard, { backgroundColor: colors.card, borderColor: colors.border, transform: [{ scale: scaleAnim }] }]}>
        <Image source={item.image} style={styles.hImage} resizeMode="cover" />
        {item.badge && (
          <View style={[styles.badge, { backgroundColor: colors.gold }]}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
        <View style={styles.hContent}>
          <View style={styles.hTop}>
            <Text style={[styles.hName, { color: colors.foreground }]} numberOfLines={1}>{item.name}</Text>
            <Pressable onPress={handleFav} hitSlop={8}>
              <Feather name={fav ? "heart" : "heart"} size={16} color={fav ? "#E53935" : colors.mutedForeground} />
            </Pressable>
          </View>
          <Text style={[styles.hDesc, { color: colors.mutedForeground }]} numberOfLines={2}>{item.description}</Text>
          <View style={styles.hBottom}>
            <Text style={[styles.hPrice, { color: colors.gold }]}>₹{item.price}</Text>
            {qty > 0 ? (
              <View style={[styles.qtyRow, { borderColor: colors.gold }]}>
                <Pressable onPress={() => updateQuantity(item.id, qty - 1)} hitSlop={8}>
                  <Feather name="minus" size={14} color={colors.gold} />
                </Pressable>
                <Text style={[styles.qtyText, { color: colors.foreground }]}>{qty}</Text>
                <Pressable onPress={handleAdd} hitSlop={8}>
                  <Feather name="plus" size={14} color={colors.gold} />
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={handleAdd} style={[styles.addBtn, { backgroundColor: colors.gold }]}>
                <Feather name="plus" size={16} color="#000" />
              </Pressable>
            )}
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, transform: [{ scale: scaleAnim }] }]}>
      <Image source={item.image} style={styles.image} resizeMode="cover" />
      {item.badge && (
        <View style={[styles.badge, { backgroundColor: colors.gold }]}>
          <Text style={styles.badgeText}>{item.badge}</Text>
        </View>
      )}
      <Pressable onPress={handleFav} style={styles.favBtn} hitSlop={8}>
        <Feather name="heart" size={15} color={fav ? "#E53935" : colors.mutedForeground} />
      </Pressable>
      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>{item.name}</Text>
          {item.isVeg && <View style={[styles.vegDot, { borderColor: "#4CAF50" }]}><View style={styles.vegInner} /></View>}
        </View>
        <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={2}>{item.description}</Text>
        <Text style={[styles.cals, { color: colors.mutedForeground }]}>{item.calories} kcal</Text>
        <View style={styles.bottom}>
          <Text style={[styles.price, { color: colors.gold }]}>₹{item.price}</Text>
          {qty > 0 ? (
            <View style={[styles.qtyRow, { borderColor: colors.gold }]}>
              <Pressable onPress={() => updateQuantity(item.id, qty - 1)} hitSlop={8}>
                <Feather name="minus" size={14} color={colors.gold} />
              </Pressable>
              <Text style={[styles.qtyText, { color: colors.foreground }]}>{qty}</Text>
              <Pressable onPress={handleAdd} hitSlop={8}>
                <Feather name="plus" size={14} color={colors.gold} />
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={handleAdd} style={[styles.addBtn, { backgroundColor: colors.gold }]}>
              <Feather name="plus" size={16} color="#000" />
            </Pressable>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    width: 170,
    marginRight: 12,
  },
  image: { width: "100%", height: 130 },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 10, fontWeight: "700", color: "#000" },
  favBtn: { position: "absolute", top: 8, right: 8, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 20, padding: 5 },
  content: { padding: 10 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  name: { fontSize: 14, fontWeight: "700", flex: 1 },
  vegDot: { width: 14, height: 14, borderRadius: 2, borderWidth: 1.5, justifyContent: "center", alignItems: "center" },
  vegInner: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#4CAF50" },
  desc: { fontSize: 11, lineHeight: 16, marginBottom: 4 },
  cals: { fontSize: 10, marginBottom: 8 },
  bottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  price: { fontSize: 16, fontWeight: "800" },
  addBtn: { width: 30, height: 30, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  qtyText: { fontSize: 14, fontWeight: "700", minWidth: 16, textAlign: "center" },
  hCard: { flexDirection: "row", borderRadius: 14, borderWidth: 1, overflow: "hidden", marginBottom: 10 },
  hImage: { width: 100, height: 100 },
  hContent: { flex: 1, padding: 10, justifyContent: "space-between" },
  hTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  hName: { fontSize: 14, fontWeight: "700", flex: 1, marginRight: 6 },
  hDesc: { fontSize: 11, lineHeight: 16 },
  hBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  hPrice: { fontSize: 16, fontWeight: "800" },
});
