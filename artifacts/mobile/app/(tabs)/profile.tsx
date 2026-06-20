import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LogoBrand } from "@/components/LogoBrand";
import { useUser } from "@/contexts/UserContext";
import { menuItems } from "@/constants/menu";
import { MenuItemCard } from "@/components/MenuItemCard";
import fonts from "@/constants/fonts";
import { useColors } from "@/hooks/useColors";
import { useLayout } from "@/hooks/useLayout";

export default function ProfileScreen() {
  const colors = useColors();
  const layout = useLayout();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, orders, reservations, favorites, logout } = useUser();
  const [activeSection, setActiveSection] = useState<"main" | "favorites" | "history">("main");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const tabBarH = Platform.OS === "web" ? 84 : Platform.OS === "ios" ? 49 + insets.bottom : 56 + insets.bottom;
  const hp = layout.hp;

  const favoriteItems = menuItems.filter((i) => favorites.includes(i.id));
  const loyaltyLevel = profile.loyaltyPoints >= 1000 ? "Gold" : profile.loyaltyPoints >= 500 ? "Silver" : "Bronze";
  const levelColors: Record<string, string> = {
    Bronze: "#CD7F32",
    Silver: "#C0C0C0",
    Gold: "#FFD700",
  };
  const nextLevelPoints = loyaltyLevel === "Bronze" ? 500 : loyaltyLevel === "Silver" ? 1000 : 2000;
  const progress = Math.min(profile.loyaltyPoints / nextLevelPoints, 1);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join me at Temptations Cafe, Kalaburagi! Use my referral code ${profile.referralCode} and get ₹50 off your first order. Best Zinger Burgers & Mojitos in town! 🍔`,
        title: "Join Temptations Cafe",
      });
    } catch {}
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  const menuLinks = [
    { icon: "clock", label: "Order History", count: orders.length, onPress: () => setActiveSection("history") },
    { icon: "heart", label: "Favourites", count: favorites.length, onPress: () => setActiveSection("favorites") },
    { icon: "calendar", label: "Reservations", count: reservations.filter((r) => r.status === "confirmed").length, onPress: () => {} },
    { icon: "gift", label: "Refer & Earn", sub: `Code: ${profile.referralCode}`, onPress: handleShare },
    { icon: "map-pin", label: "Saved Addresses", onPress: () => {} },
    { icon: "bell", label: "Notifications", onPress: () => {} },
    { icon: "settings", label: "Settings", onPress: () => {} },
    { icon: "log-out", label: "Log Out", onPress: handleLogout },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background, maxWidth: layout.contentW, width: "100%", alignSelf: "center" }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, paddingHorizontal: hp }]}>
        <LogoBrand variant="mini" />
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {activeSection === "main" ? "Profile" : activeSection === "favorites" ? "Favourites" : "Order History"}
          </Text>
          {activeSection !== "main" && (
            <Pressable onPress={() => setActiveSection("main")} hitSlop={8}>
              <Feather name="arrow-left" size={22} color={colors.foreground} />
            </Pressable>
          )}
        </View>
      </View>

      {activeSection === "favorites" ? (
        favoriteItems.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="heart" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No favourites yet</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Tap the heart on any menu item to save it here</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ padding: hp, paddingBottom: tabBarH + 24, gap: 10 }}>
            {favoriteItems.map((item) => (
              <MenuItemCard key={item.id} item={item} horizontal />
            ))}
          </ScrollView>
        )
      ) : activeSection === "history" ? (
        orders.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="clock" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No orders yet</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Your order history will appear here</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ padding: hp, paddingBottom: tabBarH + 24, gap: 12 }}>
            {orders.map((order) => (
              <View key={order.id} style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.orderDate, { color: colors.foreground }]}>{order.date}</Text>
                <Text style={[styles.orderItems, { color: colors.mutedForeground }]}>
                  {order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                </Text>
                <View style={styles.orderFooter}>
                  <Text style={[styles.orderTotal, { color: colors.gold }]}>₹{order.total}</Text>
                  <Text style={[styles.orderPts, { color: colors.mutedForeground }]}>+{order.pointsEarned} pts earned</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 100 : tabBarH + 24, paddingHorizontal: hp }}>
          <View style={styles.profileCard}>
            <View style={[styles.avatar, { backgroundColor: colors.goldDim, borderColor: colors.gold + "44" }]}>
              <Text style={[styles.avatarText, { color: colors.gold }]}>{profile.name[0]}</Text>
            </View>
            <Text style={[styles.name, { color: colors.foreground }]}>{profile.name}</Text>
            <Text style={[styles.phone, { color: colors.mutedForeground }]}>{profile.phone}</Text>
            <Text style={[styles.email, { color: colors.mutedForeground }]}>{profile.email}</Text>
            <View style={[styles.levelPill, { backgroundColor: levelColors[loyaltyLevel] + "22", borderColor: levelColors[loyaltyLevel] + "44" }]}>
              <Feather name="award" size={14} color={levelColors[loyaltyLevel]} />
              <Text style={[styles.levelText, { color: levelColors[loyaltyLevel] }]}>{loyaltyLevel} Member</Text>
            </View>
          </View>

          <View style={[styles.loyaltyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.loyaltyTop}>
              <View>
                <Text style={[styles.loyaltyPoints, { color: colors.gold }]}>{profile.loyaltyPoints}</Text>
                <Text style={[styles.loyaltyLabel, { color: colors.mutedForeground }]}>Loyalty Points</Text>
              </View>
              <View style={styles.loyaltyRight}>
                <Feather name="award" size={40} color={colors.gold} style={{ opacity: 0.25 }} />
              </View>
            </View>
            <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` as any, backgroundColor: colors.gold }]} />
            </View>
            <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
              {profile.loyaltyPoints < nextLevelPoints
                ? `${nextLevelPoints - profile.loyaltyPoints} pts to next level`
                : "Maximum level reached!"}
            </Text>
            <View style={styles.redeemRow}>
              <View style={[styles.redeemOption, { backgroundColor: colors.goldDim, borderColor: colors.gold + "33" }]}>
                <Text style={[styles.redeemVal, { color: colors.gold }]}>100 pts</Text>
                <Text style={[styles.redeemDesc, { color: colors.mutedForeground }]}>= ₹10 OFF</Text>
              </View>
              <View style={[styles.redeemOption, { backgroundColor: colors.goldDim, borderColor: colors.gold + "33" }]}>
                <Text style={[styles.redeemVal, { color: colors.gold }]}>500 pts</Text>
                <Text style={[styles.redeemDesc, { color: colors.mutedForeground }]}>Free Drink</Text>
              </View>
              <View style={[styles.redeemOption, { backgroundColor: colors.goldDim, borderColor: colors.gold + "33" }]}>
                <Text style={[styles.redeemVal, { color: colors.gold }]}>1000 pts</Text>
                <Text style={[styles.redeemDesc, { color: colors.mutedForeground }]}>Free Meal</Text>
              </View>
            </View>
          </View>

          <View style={[styles.referCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <View style={styles.referLeft}>
              <Text style={[styles.referTitle, { color: colors.foreground }]}>Refer & Earn</Text>
              <Text style={[styles.referSub, { color: colors.mutedForeground }]}>
                Invite friends and earn 50 points per referral!
              </Text>
              <View style={[styles.codePill, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="tag" size={12} color={colors.gold} />
                <Text style={[styles.codeText, { color: colors.gold }]}>{profile.referralCode}</Text>
              </View>
            </View>
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); handleShare(); }}
              style={[styles.shareBtn, { backgroundColor: colors.gold }]}
            >
              <Feather name="share-2" size={18} color="#000" />
            </Pressable>
          </View>

          <View style={[styles.menuList, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {menuLinks.map((item, idx) => (
              <React.Fragment key={item.label}>
                <Pressable
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); item.onPress(); }}
                  style={styles.menuItem}
                >
                  <View style={[styles.menuIcon, { backgroundColor: colors.goldDim }]}>
                    <Feather name={item.icon as any} size={17} color={colors.gold} />
                  </View>
                  <View style={styles.menuInfo}>
                    <Text style={[styles.menuLabel, { color: colors.foreground }]}>{item.label}</Text>
                    {item.sub && <Text style={[styles.menuSub, { color: colors.mutedForeground }]}>{item.sub}</Text>}
                  </View>
                  <View style={styles.menuRight}>
                    {item.count !== undefined && item.count > 0 && (
                      <View style={[styles.countBadge, { backgroundColor: colors.goldDim }]}>
                        <Text style={[styles.countText, { color: colors.gold }]}>{item.count}</Text>
                      </View>
                    )}
                    <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                  </View>
                </Pressable>
                {idx < menuLinks.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
              </React.Fragment>
            ))}
          </View>

          <View style={[styles.cafeInfo, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="phone" size={16} color={colors.gold} />
            <View style={styles.cafeInfoText}>
              <Text style={[styles.cafeInfoTitle, { color: colors.foreground }]}>Temptations Cafe</Text>
              <Text style={[styles.cafeInfoSub, { color: colors.mutedForeground }]}>
                Khaja Colony, Kalaburagi · 4.1★ · ₹200–₹400/person
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingBottom: 8 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 28, fontFamily: fonts.display[900], letterSpacing: -0.5 },
  profileCard: { alignItems: "center", paddingVertical: 24, paddingHorizontal: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center", borderWidth: 2, marginBottom: 12 },
  avatarText: { fontSize: 36, fontFamily: fonts.display[800] },
  name: { fontSize: 22, fontFamily: fonts.display[800], marginBottom: 4 },
  phone: { fontSize: 14, fontFamily: fonts.body[400], marginBottom: 2 },
  email: { fontSize: 12, fontFamily: fonts.body[400], marginBottom: 10, opacity: 0.85 },
  levelPill: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  levelText: { fontSize: 13, fontFamily: fonts.body[700] },
  loyaltyCard: { marginBottom: 16, borderRadius: 16, borderWidth: 1, padding: 18 },
  loyaltyTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  loyaltyPoints: { fontSize: 36, fontFamily: fonts.display[900], letterSpacing: -1 },
  loyaltyLabel: { fontSize: 12, fontFamily: fonts.body[400], marginTop: 2 },
  loyaltyRight: {},
  progressBg: { height: 6, borderRadius: 3, marginBottom: 6, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  progressLabel: { fontSize: 11, fontFamily: fonts.body[400], marginBottom: 14 },
  redeemRow: { flexDirection: "row", gap: 8 },
  redeemOption: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 10, alignItems: "center" },
  redeemVal: { fontSize: 13, fontFamily: fonts.mono[700] },
  redeemDesc: { fontSize: 10, fontFamily: fonts.body[400], marginTop: 2 },
  referCard: { marginBottom: 16, borderRadius: 16, borderWidth: 1, padding: 18, flexDirection: "row", alignItems: "center" },
  referLeft: { flex: 1, gap: 6 },
  referTitle: { fontSize: 16, fontFamily: fonts.display[700] },
  referSub: { fontSize: 12, fontFamily: fonts.body[400], lineHeight: 17 },
  codePill: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, alignSelf: "flex-start" },
  codeText: { fontSize: 13, fontFamily: fonts.mono[700], letterSpacing: 1 },
  shareBtn: { width: 46, height: 46, borderRadius: 23, justifyContent: "center", alignItems: "center", marginLeft: 12 },
  menuList: { marginBottom: 16, borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  menuIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  menuInfo: { flex: 1 },
  menuLabel: { fontSize: 14, fontFamily: fonts.body[600] },
  menuSub: { fontSize: 11, fontFamily: fonts.body[400], marginTop: 2 },
  menuRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  countBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  countText: { fontSize: 12, fontFamily: fonts.mono[700] },
  divider: { height: 1, marginLeft: 64 },
  cafeInfo: { marginBottom: 20, borderRadius: 14, borderWidth: 1, padding: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  cafeInfoText: { flex: 1 },
  cafeInfoTitle: { fontSize: 14, fontFamily: fonts.body[700], marginBottom: 3 },
  cafeInfoSub: { fontSize: 12, fontFamily: fonts.body[400] },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", gap: 10 },
  emptyTitle: { fontSize: 20, fontFamily: fonts.display[700] },
  emptySub: { fontSize: 13, fontFamily: fonts.body[400], textAlign: "center", paddingHorizontal: 40 },
  orderCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 6 },
  orderDate: { fontSize: 13, fontFamily: fonts.body[700] },
  orderItems: { fontSize: 12, fontFamily: fonts.body[400], lineHeight: 18 },
  orderFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  orderTotal: { fontSize: 16, fontFamily: fonts.mono[700] },
  orderPts: { fontSize: 11, fontFamily: fonts.body[400] },
});
