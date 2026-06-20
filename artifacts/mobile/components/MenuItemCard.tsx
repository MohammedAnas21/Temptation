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
import fonts from "@/constants/fonts";
import { useColors } from "@/hooks/useColors";
import { useLayout } from "@/hooks/useLayout";

interface Props {
  item: MenuItem;
  horizontal?: boolean;
  cardWidth?: number;
}

export function MenuItemCard({ item, horizontal = false, cardWidth }: Props) {
  const colors = useColors();
  const layout = useLayout();
  const { addItem, items, updateQuantity } = useCart();
  const { toggleFavorite, isFavorite } = useUser();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const cartItem = items.find((i) => i.id === item.id);
  const qty = cartItem?.quantity ?? 0;
  const fav = isFavorite(item.id);

  const resolvedW = cardWidth ?? layout.cardW;
  const imageH = Math.max(100, resolvedW * 0.72);

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
      <Animated.View
        style={[
          styles.hCard,
          { backgroundColor: colors.card, borderColor: colors.border, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Image source={item.image} style={styles.hImage} resizeMode="cover" />
        {item.badge && (
          <View style={[styles.badge, { backgroundColor: colors.gold }]}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
        <View style={styles.hContent}>
          <View style={styles.hTop}>
            <Text style={[styles.hName, { color: colors.foreground, fontSize: layout.fs(14) }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Pressable onPress={handleFav} hitSlop={8}>
              <Feather name="heart" size={16} color={fav ? "#E53935" : colors.mutedForeground} />
            </Pressable>
          </View>
          <Text style={[styles.hDesc, { color: colors.mutedForeground, fontSize: layout.fs(11) }]} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.hBottom}>
            <Text style={[styles.hPrice, { color: colors.gold, fontSize: layout.fs(16) }]}>₹{item.price}</Text>
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
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          transform: [{ scale: scaleAnim }],
          width: resolvedW,
          marginRight: 0,
        },
      ]}
    >
      <Image source={item.image} style={[styles.image, { height: imageH }]} resizeMode="cover" />
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
          <Text
            style={[styles.name, { color: colors.foreground, fontSize: layout.fs(13) }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          {item.isVeg && (
            <View style={[styles.vegDot, { borderColor: "#4CAF50" }]}>
              <View style={styles.vegInner} />
            </View>
          )}
        </View>
        <Text
          style={[styles.desc, { color: colors.mutedForeground, fontSize: layout.fs(10) }]}
          numberOfLines={2}
        >
          {item.description}
        </Text>
        <Text style={[styles.cals, { color: colors.mutedForeground, fontSize: layout.fs(9) }]}>
          {item.calories} kcal
        </Text>
        <View style={styles.bottom}>
          <Text style={[styles.price, { color: colors.gold, fontSize: layout.fs(15) }]}>₹{item.price}</Text>
          {qty > 0 ? (
            <View style={[styles.qtyRow, { borderColor: colors.gold }]}>
              <Pressable onPress={() => updateQuantity(item.id, qty - 1)} hitSlop={8}>
                <Feather name="minus" size={13} color={colors.gold} />
              </Pressable>
              <Text style={[styles.qtyText, { color: colors.foreground }]}>{qty}</Text>
              <Pressable onPress={handleAdd} hitSlop={8}>
                <Feather name="plus" size={13} color={colors.gold} />
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={handleAdd} style={[styles.addBtn, { backgroundColor: colors.gold }]}>
              <Feather name="plus" size={15} color="#000" />
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
  },
  image: { width: "100%" },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 10, fontFamily: fonts.mono[700], color: "#052A16" },
  favBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 5,
  },
  content: { padding: 10 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  name: { fontFamily: fonts.body[700], flex: 1 },
  vegDot: {
    width: 13,
    height: 13,
    borderRadius: 2,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  vegInner: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#4CAF50" },
  desc: { fontFamily: fonts.body[400], lineHeight: 15, marginBottom: 4 },
  cals: { fontFamily: fonts.mono[400], marginBottom: 8 },
  bottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  price: { fontFamily: fonts.mono[700] },
  addBtn: { width: 28, height: 28, borderRadius: 9, justifyContent: "center", alignItems: "center" },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  qtyText: { fontSize: 13, fontFamily: fonts.mono[700], minWidth: 14, textAlign: "center" },
  hCard: { flexDirection: "row", borderRadius: 14, borderWidth: 1, overflow: "hidden", marginBottom: 10 },
  hImage: { width: 100, height: 100 },
  hContent: { flex: 1, padding: 10, justifyContent: "space-between" },
  hTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  hName: { fontFamily: fonts.body[700], flex: 1, marginRight: 6 },
  hDesc: { fontFamily: fonts.body[400], lineHeight: 16 },
  hBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  hPrice: { fontFamily: fonts.mono[700] },
});
