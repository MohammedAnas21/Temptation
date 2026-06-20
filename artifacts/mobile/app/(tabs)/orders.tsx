import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LogoBrand } from "@/components/LogoBrand";
import { useCart } from "@/contexts/CartContext";
import { useUser } from "@/contexts/UserContext";
import { Order } from "@/contexts/UserContext";
import fonts from "@/constants/fonts";
import { useColors } from "@/hooks/useColors";
import { useLayout } from "@/hooks/useLayout";

type Tab = "cart" | "orders";

const STATUS_COLORS: Record<string, string> = {
  placed: "#C8A028",
  preparing: "#2196F3",
  ready: "#4CAF50",
  delivered: "#888",
};
const STATUS_LABELS: Record<string, string> = {
  placed: "Order Placed",
  preparing: "Preparing",
  ready: "Ready",
  delivered: "Delivered",
};

export default function OrdersScreen() {
  const colors = useColors();
  const layout = useLayout();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>("cart");
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [orderType, setOrderType] = useState<"delivery" | "dine-in">("delivery");
  const [selectedDineInTable, setSelectedDineInTable] = useState<string | null>(null);
  const {
    items, updateQuantity, removeItem, clearCart,
    total, itemCount, appliedCoupon, discount,
    applyCoupon, removeCoupon, finalTotal, deliveryFee,
  } = useCart();
  const { orders, addOrder } = useUser();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const tabBarH = Platform.OS === "web" ? 84 : Platform.OS === "ios" ? 49 + insets.bottom : 56 + insets.bottom;
  const hp = layout.hp;

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    const ok = applyCoupon(couponInput.trim());
    if (ok) {
      setCouponError("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setCouponError("Invalid or expired coupon code");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handlePlaceOrder = () => {
    if (items.length === 0) return;
    if (orderType === "dine-in" && !selectedDineInTable) {
      Alert.alert("Select Table", "Please select a table for your dine-in order.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newOrder: Order = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      }),
      items: items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
      total: finalTotal,
      status: "placed",
      pointsEarned: Math.floor(finalTotal / 10),
      type: orderType,
      tableId: orderType === "dine-in" && selectedDineInTable ? selectedDineInTable : undefined,
    };
    addOrder(newOrder);
    clearCart();
    setCouponInput("");
    setSelectedDineInTable(null);
    setActiveTab("orders");
    Alert.alert(
      "Order Placed! 🎉",
      `Your order is confirmed. You earned ${newOrder.pointsEarned} loyalty points!`,
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background, maxWidth: layout.contentW, width: "100%", alignSelf: "center" }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, paddingHorizontal: hp }]}>
        <LogoBrand variant="mini" />
        <Text style={[styles.title, { color: colors.foreground, fontSize: layout.fs(26) }]}>
          {activeTab === "cart" ? "Your Cart" : "My Orders"}
        </Text>
        <View style={[styles.tabs, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {(["cart", "orders"] as Tab[]).map((t) => (
            <Pressable
              key={t}
              onPress={() => setActiveTab(t)}
              style={[styles.tab, activeTab === t && { backgroundColor: colors.gold }]}
            >
              <Feather
                name={t === "cart" ? "shopping-bag" : "clock"}
                size={14}
                color={activeTab === t ? "#000" : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === t ? "#000" : colors.mutedForeground,
                    fontWeight: activeTab === t ? "700" : "500",
                    fontSize: layout.fs(13),
                  },
                ]}
              >
                {t === "cart" ? `Cart${itemCount > 0 ? ` (${itemCount})` : ""}` : "Orders"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {activeTab === "cart" ? (
          items.length === 0 ? (
            <View style={styles.empty}>
              <Feather name="shopping-bag" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground, fontSize: layout.fs(20) }]}>
                Cart is empty
              </Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground, fontSize: layout.fs(13) }]}>
                Add items from our menu to get started
              </Text>
            </View>
          ) : (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: tabBarH + 90 }}
              showsVerticalScrollIndicator={false}
            >
            <View style={{ paddingHorizontal: hp, gap: 10, marginTop: 16 }}>
              {items.map((item) => (
                <View
                  key={item.id}
                  style={[styles.cartItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <Image source={item.image} style={styles.cartImg} resizeMode="cover" />
                  <View style={styles.cartInfo}>
                    <Text
                      style={[styles.cartName, { color: colors.foreground, fontSize: layout.fs(13) }]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <Text style={[styles.cartPrice, { color: colors.gold, fontSize: layout.fs(14) }]}>
                      ₹{item.price} × {item.quantity}
                    </Text>
                  </View>
                  <View style={styles.qtyControls}>
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        updateQuantity(item.id, item.quantity - 1);
                      }}
                      style={[styles.qtyBtn, { borderColor: colors.border }]}
                      hitSlop={4}
                    >
                      <Feather name="minus" size={13} color={colors.foreground} />
                    </Pressable>
                    <Text style={[styles.qtyNum, { color: colors.foreground }]}>{item.quantity}</Text>
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        updateQuantity(item.id, item.quantity + 1);
                      }}
                      style={[styles.qtyBtn, { borderColor: colors.border }]}
                      hitSlop={4}
                    >
                      <Feather name="plus" size={13} color={colors.foreground} />
                    </Pressable>
                  </View>
                  <Pressable onPress={() => removeItem(item.id)} hitSlop={8} style={{ marginLeft: 8 }}>
                    <Feather name="x" size={16} color={colors.mutedForeground} />
                  </Pressable>
                </View>
              ))}
            </View>

            <View style={{ paddingHorizontal: hp, marginTop: 20 }}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontSize: layout.fs(16) }]}>
                Order Type
              </Text>
              <View style={styles.typeRow}>
                {(["delivery", "dine-in"] as const).map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => setOrderType(t)}
                    style={[
                      styles.typeBtn,
                      {
                        borderColor: orderType === t ? colors.gold : colors.border,
                        backgroundColor: orderType === t ? colors.goldDim : colors.card,
                      },
                    ]}
                  >
                    <Feather
                      name={t === "delivery" ? "truck" : "coffee"}
                      size={16}
                      color={orderType === t ? colors.gold : colors.mutedForeground}
                    />
                    <Text
                      style={[
                        styles.typeBtnText,
                        { color: orderType === t ? colors.gold : colors.mutedForeground, fontSize: layout.fs(14) },
                      ]}
                    >
                      {t === "delivery" ? "Delivery" : "Dine-In"}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {orderType === "dine-in" && (
              <View style={{ paddingHorizontal: hp, marginTop: 20 }}>
                <Text style={[styles.sectionTitle, { color: colors.foreground, fontSize: layout.fs(16), marginBottom: 8 }]}>
                  Select Dine-In Table
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                  {["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9"].map((tableId) => {
                    const isSelectedTable = selectedDineInTable === tableId;
                    return (
                      <Pressable
                        key={tableId}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setSelectedDineInTable(tableId);
                        }}
                        style={{
                          backgroundColor: isSelectedTable ? colors.gold : colors.card,
                          borderColor: isSelectedTable ? colors.gold : colors.border,
                          borderWidth: 1.5,
                          borderRadius: 10,
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          minWidth: 64,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ color: isSelectedTable ? "#000" : colors.foreground, fontWeight: "700", fontSize: layout.fs(13) }}>
                          {tableId}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            <View style={{ paddingHorizontal: hp, marginTop: 20 }}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontSize: layout.fs(16) }]}>
                Coupon Code
              </Text>
              {appliedCoupon ? (
                <View
                  style={[
                    styles.appliedCoupon,
                    { backgroundColor: colors.goldDim, borderColor: colors.gold + "44" },
                  ]}
                >
                  <Feather name="tag" size={14} color={colors.gold} />
                  <Text style={[styles.appliedCode, { color: colors.gold, fontSize: layout.fs(13) }]}>
                    {appliedCoupon} — ₹{discount} OFF
                  </Text>
                  <Pressable onPress={removeCoupon} hitSlop={8} style={{ marginLeft: "auto" }}>
                    <Feather name="x" size={14} color={colors.gold} />
                  </Pressable>
                </View>
              ) : (
                <View
                  style={[styles.couponRow, { borderColor: colors.border, backgroundColor: colors.card }]}
                >
                  <TextInput
                    style={[styles.couponInput, { color: colors.foreground, fontSize: layout.fs(14) }]}
                    placeholder="Enter code (e.g. HAPPY20)"
                    placeholderTextColor={colors.mutedForeground}
                    value={couponInput}
                    onChangeText={(t) => { setCouponInput(t); setCouponError(""); }}
                    autoCapitalize="characters"
                  />
                  <Pressable
                    onPress={handleApplyCoupon}
                    style={[styles.applyBtn, { backgroundColor: colors.gold }]}
                  >
                    <Text style={[styles.applyText, { fontSize: layout.fs(14) }]}>Apply</Text>
                  </Pressable>
                </View>
              )}
              {couponError.length > 0 && (
                <Text style={[styles.couponErr, { fontSize: layout.fs(12) }]}>{couponError}</Text>
              )}
            </View>

            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  marginHorizontal: hp,
                },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 12, fontSize: layout.fs(16) }]}>
                Order Summary
              </Text>
              {[
                { label: "Subtotal", val: `₹${total}` },
                { label: "Delivery Fee", val: deliveryFee === 0 ? "FREE" : `₹${deliveryFee}` },
                ...(discount > 0 ? [{ label: "Discount", val: `-₹${discount}` }] : []),
              ].map((r) => (
                <View key={r.label} style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.mutedForeground, fontSize: layout.fs(13) }]}>
                    {r.label}
                  </Text>
                  <Text
                    style={[
                      styles.summaryVal,
                      { color: r.label === "Discount" ? "#4CAF50" : colors.foreground, fontSize: layout.fs(13) },
                    ]}
                  >
                    {r.val}
                  </Text>
                </View>
              ))}
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.summaryRow}>
                <Text style={[styles.totalLabel, { color: colors.foreground, fontSize: layout.fs(16) }]}>
                  Total
                </Text>
                <Text style={[styles.totalVal, { color: colors.gold, fontSize: layout.fs(20) }]}>
                  ₹{finalTotal}
                </Text>
              </View>
              <Text style={[styles.freeDeliveryNote, { color: colors.mutedForeground, fontSize: layout.fs(11) }]}>
                {total >= 500
                  ? "✓ Free delivery applied!"
                  : `Add ₹${500 - total} more for free delivery`}
              </Text>
            </View>
          </ScrollView>
        )
      ) : orders.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="clock" size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground, fontSize: layout.fs(20) }]}>
            No orders yet
          </Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground, fontSize: layout.fs(13) }]}>
            Your order history will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          contentContainerStyle={{
            paddingHorizontal: hp,
            paddingBottom: Platform.OS === "web" ? 100 : tabBarH + 24,
            paddingTop: 16,
            gap: 12,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: order }) => (
            <View
              style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={styles.orderHeader}>
                <View>
                  <Text style={[styles.orderId, { color: colors.foreground, fontSize: layout.fs(15) }]}>
                    Order #{order.id.slice(-6)}
                  </Text>
                  <Text style={[styles.orderDate, { color: colors.mutedForeground, fontSize: layout.fs(11) }]}>
                    {order.date}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: STATUS_COLORS[order.status] + "22" },
                  ]}
                >
                  <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[order.status] }]} />
                  <Text style={[styles.statusText, { color: STATUS_COLORS[order.status], fontSize: layout.fs(12) }]}>
                    {STATUS_LABELS[order.status]}
                  </Text>
                </View>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 10 }]} />
              {order.items.map((i, idx) => (
                <Text key={idx} style={[styles.orderItem, { color: colors.mutedForeground, fontSize: layout.fs(12) }]}>
                  {i.quantity}× {i.name} · ₹{i.price * i.quantity}
                </Text>
              ))}
              <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 10 }]} />
              <View style={styles.orderFooter}>
                <Text style={[styles.orderTotal, { color: colors.foreground, fontSize: layout.fs(14) }]}>
                  Total:{" "}
                  <Text style={{ color: colors.gold }}>₹{order.total}</Text>
                </Text>
                <View style={[styles.pointsBadge, { backgroundColor: colors.goldDim }]}>
                  <Feather name="award" size={12} color={colors.gold} />
                  <Text style={[styles.pointsText, { color: colors.gold, fontSize: layout.fs(12) }]}>
                    +{order.pointsEarned} pts
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      )}
      </View>

      {activeTab === "cart" && items.length > 0 && (
        <View style={[styles.placeOrderBar, { paddingBottom: tabBarH + 12, paddingHorizontal: hp, maxWidth: layout.contentW, width: "100%", left: "auto", right: "auto", alignSelf: "center" }]}>
          <Pressable
            onPress={handlePlaceOrder}
            style={[styles.placeOrderBtn, { backgroundColor: colors.gold }]}
          >
            <Text style={[styles.placeOrderText, { fontSize: layout.fs(16) }]}>
              Place Order · ₹{finalTotal}
            </Text>
            <Feather name="arrow-right" size={20} color="#000" />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingBottom: 8 },
  title: { fontFamily: fonts.display[900], letterSpacing: -0.5, marginBottom: 12 },
  tabs: { flexDirection: "row", borderRadius: 12, borderWidth: 1, padding: 3, gap: 3 },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
  },
  tabText: { fontFamily: fonts.body[500] },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", gap: 10 },
  emptyTitle: { fontFamily: fonts.display[700] },
  emptySub: { fontFamily: fonts.body[400], textAlign: "center", paddingHorizontal: 40 },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  cartImg: { width: 70, height: 70 },
  cartInfo: { flex: 1, padding: 10 },
  cartName: { fontFamily: fonts.body[600], marginBottom: 4 },
  cartPrice: { fontFamily: fonts.mono[700] },
  qtyControls: { flexDirection: "row", alignItems: "center", gap: 8, paddingRight: 8 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyNum: { fontSize: 14, fontFamily: fonts.mono[700], minWidth: 18, textAlign: "center" },
  sectionTitle: { fontFamily: fonts.display[700], marginBottom: 10 },
  typeRow: { flexDirection: "row", gap: 10 },
  typeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
  },
  typeBtnText: { fontFamily: fonts.body[600] },
  couponRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  couponInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 12, fontFamily: fonts.body[400] },
  applyBtn: { paddingHorizontal: 18, paddingVertical: 12 },
  applyText: { fontFamily: fonts.body[700], color: "#052A16" },
  appliedCoupon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  appliedCode: { fontFamily: fonts.mono[400] },
  couponErr: { fontFamily: fonts.body[400], color: "#E53935", marginTop: 6 },
  summaryCard: { marginTop: 20, marginBottom: 8, borderRadius: 14, borderWidth: 1, padding: 16 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  summaryLabel: { fontFamily: fonts.body[400] },
  summaryVal: { fontFamily: fonts.mono[400] },
  divider: { height: 1, borderRadius: 1 },
  totalLabel: { fontFamily: fonts.display[800] },
  totalVal: { fontFamily: fonts.mono[700] },
  freeDeliveryNote: { fontFamily: fonts.body[400], marginTop: 8 },
  orderCard: { borderRadius: 14, borderWidth: 1, padding: 14 },
  orderHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  orderId: { fontFamily: fonts.body[700], marginBottom: 3 },
  orderDate: { fontFamily: fonts.body[400] },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontFamily: fonts.body[600] },
  orderItem: { fontFamily: fonts.body[400], lineHeight: 20 },
  orderFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  orderTotal: { fontFamily: fonts.mono[700] },
  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pointsText: { fontFamily: fonts.body[700] },
  placeOrderBar: { paddingTop: 12 },
  placeOrderBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 16,
    paddingVertical: 16,
  },
  placeOrderText: { fontFamily: fonts.body[800], color: "#052A16" },
});
