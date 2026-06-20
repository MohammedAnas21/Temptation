import { Feather } from "@expo/vector-icons";
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
import { LogoBrand } from "@/components/LogoBrand";
import { useCart } from "@/contexts/CartContext";
import { menuItems, offers, reviews, events } from "@/constants/menu";
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
          <LogoBrand variant="header" />
          <View style={styles.locRow}>
            <Feather name="map-pin" size={11} color={colors.emeraldLight} />
            <Text style={[styles.locText, { color: colors.mutedForeground }]}>Kalaburagi</Text>
          </View>
        </View>
        <Pressable
          onPress={() => router.push("/(tabs)/orders")}
          style={[styles.cartBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
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
            source={require("@/assets/images/ambience.png")}
            style={styles.heroImg}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <View style={[styles.ratingPill, { backgroundColor: "rgba(200,151,58,0.18)", borderColor: "rgba(200,151,58,0.35)" }]}>
              <Feather name="star" size={12} color={colors.gold} />
              <Text style={[styles.ratingText, { color: colors.gold }]}>4.1 · 90+ Google Reviews</Text>
            </View>
            <Text style={styles.heroTitle}>Best Burgers &{"\n"}Mojitos In{"\n"}Kalaburagi</Text>
            <Text style={[styles.heroSub, { color: "rgba(245,240,232,0.65)" }]}>
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
                style={[styles.ctaOutline, { borderColor: "rgba(245,240,232,0.4)" }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/(tabs)/reserve");
                }}
              >
                <Feather name="calendar" size={16} color={colors.ivory} />
                <Text style={[styles.ctaOutlineText, { color: colors.ivory }]}>Reserve Table</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          {[
            { icon: "clock", label: "20-35 min", sub: "Delivery" },
            { icon: "star", label: "4.1 Stars", sub: "90+ Reviews" },
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
            scrollEnabled
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
            renderItem={({ item }) => (
              <Pressable onPress={() => router.push(`/item/${item.id}`)}>
                <MenuItemCard item={item} />
              </Pressable>
            )}
            scrollEnabled
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
            renderItem={({ item }) => (
              <Pressable onPress={() => router.push(`/item/${item.id}`)}>
                <MenuItemCard item={item} />
              </Pressable>
            )}
            scrollEnabled
          />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Events & Experiences" subtitle="Book your special occasion" />
          <FlatList
            data={events}
            keyExtractor={(e) => e.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20, paddingRight: 8 }}
            renderItem={({ item: ev }) => (
              <Pressable
                style={[styles.eventCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/(tabs)/reserve");
                }}
              >
                <Image source={ev.image} style={styles.eventImage} resizeMode="cover" />
                <View style={styles.eventOverlay} />
                <View style={styles.eventContent}>
                  <View style={[styles.eventIconWrap, { backgroundColor: colors.goldDim, borderColor: colors.gold + "33" }]}>
                    <Feather name={ev.icon as any} size={16} color={colors.gold} />
                  </View>
                  <Text style={[styles.eventTitle, { color: colors.ivory }]}>{ev.title}</Text>
                  <Text style={[styles.eventSub, { color: "rgba(245,240,232,0.6)" }]}>{ev.subtitle}</Text>
                  <View style={[styles.eventPricePill, { backgroundColor: colors.goldDim }]}>
                    <Text style={[styles.eventPrice, { color: colors.gold }]}>{ev.price}</Text>
                  </View>
                </View>
              </Pressable>
            )}
            scrollEnabled
          />
        </View>

        <View style={[styles.loyaltySection]}>
          <View style={[styles.loyaltyCard, { backgroundColor: colors.emerald, borderColor: colors.emeraldLight + "55" }]}>
            <View style={styles.loyaltyLeft}>
              <View style={[styles.loyaltyIconWrap, { backgroundColor: colors.goldDim }]}>
                <Feather name="award" size={20} color={colors.gold} />
              </View>
              <Text style={[styles.loyaltyTitle, { color: colors.gold }]}>Loyalty Rewards</Text>
              <Text style={[styles.loyaltySub, { color: colors.mutedForeground }]}>
                Earn points on every order. Redeem for free drinks, discounts & exclusive perks!
              </Text>
              <Pressable
                style={[styles.loyaltyBtn, { backgroundColor: colors.gold }]}
                onPress={() => router.push("/(tabs)/profile")}
              >
                <Text style={styles.loyaltyBtnText}>View My Rewards</Text>
              </Pressable>
            </View>
            <Feather name="award" size={60} color={colors.gold} style={{ opacity: 0.12, position: "absolute", right: 16, top: 16 }} />
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
            scrollEnabled
          />
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Popular Right Now"
            subtitle="Trending items"
            onSeeAll={() => router.push("/(tabs)/menu")}
          />
          <FlatList
            data={popular.slice(0, 5)}
            keyExtractor={(i) => i.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20, paddingRight: 8 }}
            renderItem={({ item }) => (
              <Pressable onPress={() => router.push(`/item/${item.id}`)}>
                <MenuItemCard item={item} />
              </Pressable>
            )}
            scrollEnabled
          />
        </View>

        <Pressable
          style={[styles.mapSection, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {}}
        >
          <View style={[styles.mapIconWrap, { backgroundColor: colors.emeraldDim }]}>
            <Feather name="map-pin" size={22} color={colors.emeraldLight} />
          </View>
          <View style={styles.mapInfo}>
            <Text style={[styles.mapTitle, { color: colors.foreground }]}>Find Us</Text>
            <Text style={[styles.mapAddr, { color: colors.mutedForeground }]}>
              Opp. Bibi Raza Girls College, Khaja Colony,{"\n"}Kalaburagi, Karnataka 585104
            </Text>
            <View style={styles.mapMeta}>
              <View style={[styles.openPill, { backgroundColor: colors.emeraldDim }]}>
                <View style={[styles.openDot, { backgroundColor: colors.emeraldLight }]} />
                <Text style={[styles.openText, { color: colors.emeraldLight }]}>Open · Closes 10:30 PM</Text>
              </View>
            </View>
          </View>
          <Pressable style={[styles.dirBtn, { backgroundColor: colors.goldDim, borderColor: colors.gold + "44" }]}>
            <Feather name="navigation" size={16} color={colors.gold} />
          </Pressable>
        </Pressable>

        <View style={[styles.contactRow, { paddingHorizontal: 20, marginBottom: 28 }]}>
          <Pressable style={[styles.contactBtn, { backgroundColor: "#25D366" + "18", borderColor: "#25D366" + "44" }]}>
            <Text style={styles.contactIcon}>💬</Text>
            <Text style={[styles.contactText, { color: "#25D366" }]}>WhatsApp</Text>
          </Pressable>
          <Pressable style={[styles.contactBtn, { backgroundColor: colors.goldDim, borderColor: colors.gold + "44" }]}>
            <Feather name="phone" size={16} color={colors.gold} />
            <Text style={[styles.contactText, { color: colors.gold }]}>Call Us</Text>
          </Pressable>
          <Pressable style={[styles.contactBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Feather name="share-2" size={16} color={colors.mutedForeground} />
            <Text style={[styles.contactText, { color: colors.mutedForeground }]}>Share</Text>
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
  cartBtn: { width: 42, height: 42, borderRadius: 21, justifyContent: "center", alignItems: "center", borderWidth: 1 },
  badge: { position: "absolute", top: -2, right: -2, width: 18, height: 18, borderRadius: 9, justifyContent: "center", alignItems: "center" },
  badgeNum: { fontSize: 10, fontWeight: "800", color: "#000" },
  hero: { height: 430, position: "relative" },
  heroImg: { width: "100%", height: "100%" },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(7,15,12,0.6)",
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
    marginBottom: 14,
  },
  ratingText: { fontSize: 12, fontWeight: "600" },
  heroTitle: { fontSize: 36, fontWeight: "900", color: "#F5F0E8", lineHeight: 44, letterSpacing: -0.5, marginBottom: 8 },
  heroSub: { fontSize: 13, marginBottom: 22 },
  heroButtons: { flexDirection: "row", gap: 10 },
  ctaBtn: { flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 20, paddingVertical: 13, borderRadius: 30 },
  ctaBtnText: { fontSize: 14, fontWeight: "800", color: "#000" },
  ctaOutline: { flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 20, paddingVertical: 13, borderRadius: 30, borderWidth: 1.5 },
  ctaOutlineText: { fontSize: 14, fontWeight: "700" },
  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 20, paddingVertical: 16 },
  statCard: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 12, alignItems: "center", gap: 4 },
  statVal: { fontSize: 13, fontWeight: "700" },
  statSub: { fontSize: 10 },
  section: { marginBottom: 28 },
  eventCard: { width: 220, borderRadius: 16, marginRight: 12, overflow: "hidden", height: 190 },
  eventImage: { width: "100%", height: "100%", position: "absolute" },
  eventOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(7,15,12,0.65)" },
  eventContent: { flex: 1, padding: 14, justifyContent: "flex-end" },
  eventIconWrap: { width: 32, height: 32, borderRadius: 10, borderWidth: 1, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  eventTitle: { fontSize: 15, fontWeight: "800", marginBottom: 2 },
  eventSub: { fontSize: 11, marginBottom: 8 },
  eventPricePill: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start" },
  eventPrice: { fontSize: 11, fontWeight: "700" },
  loyaltySection: { paddingHorizontal: 20, marginBottom: 28 },
  loyaltyCard: { borderRadius: 18, borderWidth: 1, padding: 22, overflow: "hidden" },
  loyaltyLeft: { gap: 8, zIndex: 1 },
  loyaltyIconWrap: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  loyaltyTitle: { fontSize: 20, fontWeight: "900" },
  loyaltySub: { fontSize: 12, lineHeight: 18, maxWidth: "80%" },
  loyaltyBtn: { alignSelf: "flex-start", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, marginTop: 4 },
  loyaltyBtnText: { fontSize: 13, fontWeight: "800", color: "#000" },
  mapSection: { flexDirection: "row", alignItems: "center", marginHorizontal: 20, marginBottom: 16, borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  mapIconWrap: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  mapInfo: { flex: 1 },
  mapTitle: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  mapAddr: { fontSize: 12, lineHeight: 18, marginBottom: 8 },
  mapMeta: {},
  openPill: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start" },
  openDot: { width: 6, height: 6, borderRadius: 3 },
  openText: { fontSize: 11, fontWeight: "600" },
  dirBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center", borderWidth: 1 },
  contactRow: { flexDirection: "row", gap: 10 },
  contactBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 12, borderWidth: 1, paddingVertical: 12 },
  contactIcon: { fontSize: 16 },
  contactText: { fontSize: 12, fontWeight: "700" },
});
