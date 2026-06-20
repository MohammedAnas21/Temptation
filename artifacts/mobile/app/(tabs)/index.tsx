import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OfferCard } from "@/components/OfferCard";
import { ReviewCard } from "@/components/ReviewCard";
import { SectionHeader } from "@/components/SectionHeader";
import { MenuItemCard } from "@/components/MenuItemCard";
import { useCart } from "@/contexts/CartContext";
import { menuItems, offers, reviews } from "@/constants/menu";
import { useColors } from "@/hooks/useColors";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { itemCount } = useCart();
  const scrollY = useRef(new Animated.Value(0)).current;

  const featured = menuItems.filter((i) => i.isFeatured);
  const popular = menuItems.filter((i) => i.isPopular);
  const bestSellers = menuItems.filter((i) => i.isBestSeller);

  const headerBg = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: ["transparent", colors.background],
    extrapolate: "clamp",
  });

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.header, { paddingTop: topPad + 10, backgroundColor: headerBg }]}>
        <View style={styles.logoRow}>
          <View style={styles.logoTextWrap}>
            <Text style={[styles.logoT, { color: colors.gold }]}>Temptations</Text>
            <Text style={[styles.logoC, { color: colors.foreground }]}>CAFE</Text>
          </View>
          <View style={[styles.locRow]}>
            <Feather name="map-pin" size={13} color={colors.gold} />
            <Text style={[styles.locText, { color: colors.mutedForeground }]}>Kalaburagi</Text>
          </View>
        </View>
        <Pressable
          onPress={() => router.push("/(tabs)/orders")}
          style={[styles.cartBtn, { backgroundColor: colors.card }]}
        >
          <Feather name="shopping-bag" size={20} color={colors.foreground} />
          {itemCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.gold }]}>
              <Text style={styles.badgeNum}>{itemCount}</Text>
            </View>
          )}
        </Pressable>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 100 : 100 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.hero}>
          <Image
            source={require("@/assets/images/hero_banner.png")}
            style={styles.heroImg}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <View style={[styles.ratingPill, { backgroundColor: "rgba(200,151,58,0.2)", borderColor: "rgba(200,151,58,0.4)" }]}>
              <Feather name="star" size={12} color={colors.gold} />
              <Text style={[styles.ratingText, { color: colors.gold }]}>4.1 · 90+ Reviews</Text>
            </View>
            <Text style={styles.heroTitle}>Best Burgers &{"\n"}Mojitos In{"\n"}Kalaburagi</Text>
            <Text style={[styles.heroSub, { color: "rgba(255,255,255,0.7)" }]}>
              Modern Cafe & Fast Food · ₹200–₹400/person
            </Text>
            <View style={styles.heroButtons}>
              <Pressable
                style={[styles.ctaBtn, { backgroundColor: colors.gold }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push("/(tabs)/menu");
                }}
              >
                <Feather name="shopping-bag" size={16} color="#000" />
                <Text style={styles.ctaBtnText}>Order Now</Text>
              </Pressable>
              <Pressable
                style={[styles.ctaOutline, { borderColor: colors.gold }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/(tabs)/reserve");
                }}
              >
                <Feather name="calendar" size={16} color={colors.gold} />
                <Text style={[styles.ctaOutlineText, { color: colors.gold }]}>Reserve Table</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          {[
            { icon: "clock", label: "20-35 min", sub: "Delivery" },
            { icon: "star", label: "4.1 Stars", sub: "Rating" },
            { icon: "truck", label: "Free", sub: "Over ₹500" },
          ].map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name={s.icon as any} size={18} color={colors.gold} />
              <Text style={[styles.statVal, { color: colors.foreground }]}>{s.label}</Text>
              <Text style={[styles.statSub, { color: colors.mutedForeground }]}>{s.sub}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <SectionHeader title="Today's Offers" subtitle="Limited time deals" />
          <FlatList
            data={offers}
            keyExtractor={(i) => i.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20, paddingRight: 8 }}
            renderItem={({ item }) => <OfferCard offer={item} />}
            scrollEnabled={true}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Featured Items"
            subtitle="Handpicked for you"
            onSeeAll={() => router.push("/(tabs)/menu")}
          />
          <FlatList
            data={featured}
            keyExtractor={(i) => i.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20, paddingRight: 8 }}
            renderItem={({ item }) => <MenuItemCard item={item} />}
            scrollEnabled={true}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Best Sellers"
            subtitle="Most loved by our customers"
            onSeeAll={() => router.push("/(tabs)/menu")}
          />
          <FlatList
            data={bestSellers}
            keyExtractor={(i) => i.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20, paddingRight: 8 }}
            renderItem={({ item }) => <MenuItemCard item={item} />}
            scrollEnabled={true}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Popular Items"
            subtitle="Trending right now"
            onSeeAll={() => router.push("/(tabs)/menu")}
          />
          <FlatList
            data={popular}
            keyExtractor={(i) => i.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20, paddingRight: 8 }}
            renderItem={({ item }) => <MenuItemCard item={item} />}
            scrollEnabled={true}
          />
        </View>

        <View style={styles.loyaltySection}>
          <View style={[styles.loyaltyCard, { backgroundColor: colors.secondary, borderColor: "rgba(200,151,58,0.3)" }]}>
            <View style={styles.loyaltyLeft}>
              <Text style={[styles.loyaltyTitle, { color: colors.gold }]}>Loyalty Rewards</Text>
              <Text style={[styles.loyaltySub, { color: colors.mutedForeground }]}>
                Earn points on every order. Redeem for free drinks & discounts!
              </Text>
              <Pressable
                style={[styles.loyaltyBtn, { backgroundColor: colors.gold }]}
                onPress={() => router.push("/(tabs)/profile")}
              >
                <Text style={styles.loyaltyBtnText}>View Rewards</Text>
              </Pressable>
            </View>
            <View style={styles.loyaltyRight}>
              <Feather name="award" size={48} color={colors.gold} style={{ opacity: 0.3 }} />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="What Customers Say" subtitle="Real reviews from real people" />
          <FlatList
            data={reviews}
            keyExtractor={(i) => i.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20, paddingRight: 8 }}
            renderItem={({ item }) => <ReviewCard review={item} />}
            scrollEnabled={true}
          />
        </View>

        <View style={[styles.mapSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="map-pin" size={24} color={colors.gold} />
          <View style={styles.mapInfo}>
            <Text style={[styles.mapTitle, { color: colors.foreground }]}>Find Us</Text>
            <Text style={[styles.mapAddr, { color: colors.mutedForeground }]}>
              Opp. Bibi Raza Girls College, Khaja Colony,{"\n"}Kalaburagi, Karnataka 585104
            </Text>
          </View>
          <Pressable style={[styles.dirBtn, { backgroundColor: colors.goldDim, borderColor: colors.gold + "44" }]}>
            <Feather name="navigation" size={16} color={colors.gold} />
          </Pressable>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  logoRow: { gap: 2 },
  logoTextWrap: { flexDirection: "row", alignItems: "baseline", gap: 5 },
  logoT: { fontSize: 20, fontWeight: "800", letterSpacing: -0.5 },
  logoC: { fontSize: 13, fontWeight: "600", letterSpacing: 3 },
  locRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  locText: { fontSize: 12 },
  cartBtn: { width: 42, height: 42, borderRadius: 21, justifyContent: "center", alignItems: "center" },
  badge: { position: "absolute", top: -2, right: -2, width: 18, height: 18, borderRadius: 9, justifyContent: "center", alignItems: "center" },
  badgeNum: { fontSize: 10, fontWeight: "800", color: "#000" },
  hero: { height: 420, position: "relative" },
  heroImg: { width: "100%", height: "100%" },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
    background: "linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.2))" as any,
  },
  heroContent: { position: "absolute", bottom: 30, left: 20, right: 20 },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  ratingText: { fontSize: 12, fontWeight: "600" },
  heroTitle: { fontSize: 34, fontWeight: "900", color: "#fff", lineHeight: 40, letterSpacing: -0.5, marginBottom: 8 },
  heroSub: { fontSize: 13, marginBottom: 20 },
  heroButtons: { flexDirection: "row", gap: 10 },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 30,
  },
  ctaBtnText: { fontSize: 14, fontWeight: "800", color: "#000" },
  ctaOutline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 30,
    borderWidth: 1.5,
  },
  ctaOutlineText: { fontSize: 14, fontWeight: "700" },
  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 20, paddingVertical: 16 },
  statCard: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 12, alignItems: "center", gap: 4 },
  statVal: { fontSize: 13, fontWeight: "700" },
  statSub: { fontSize: 10 },
  section: { marginBottom: 28 },
  loyaltySection: { paddingHorizontal: 20, marginBottom: 28 },
  loyaltyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  loyaltyLeft: { flex: 1, gap: 8 },
  loyaltyTitle: { fontSize: 18, fontWeight: "800" },
  loyaltySub: { fontSize: 12, lineHeight: 18 },
  loyaltyBtn: { alignSelf: "flex-start", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  loyaltyBtnText: { fontSize: 13, fontWeight: "700", color: "#000" },
  loyaltyRight: { marginLeft: 10 },
  mapSection: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 28,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  mapInfo: { flex: 1 },
  mapTitle: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  mapAddr: { fontSize: 12, lineHeight: 18 },
  dirBtn: { width: 38, height: 38, borderRadius: 10, justifyContent: "center", alignItems: "center", borderWidth: 1 },
});
