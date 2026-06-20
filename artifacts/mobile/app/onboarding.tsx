import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LogoBrand } from "@/components/LogoBrand";
import { useColors } from "@/hooks/useColors";

const { width, height } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    title: "Welcome to\nTemptations Cafe",
    subtitle: "Kalaburagi's most beloved cafe. Luxury dining, legendary flavours, unforgettable experiences.",
    icon: "coffee",
    image: require("@/assets/images/ambience.png"),
  },
  {
    id: "2",
    title: "Reserve\nYour Table",
    subtitle: "Book your perfect spot — indoor or outdoor seating, for any occasion. Confirmed instantly.",
    icon: "calendar",
    image: require("@/assets/images/event_birthday.png"),
  },
  {
    id: "3",
    title: "Order\nDelicious Food",
    subtitle: "Zinger Burgers, Cheese Burst Pizza, Chicken Popcorn, Special Mojitos. All at your fingertips.",
    icon: "shopping-bag",
    image: require("@/assets/images/burger.png"),
  },
  {
    id: "4",
    title: "Earn Rewards\n& Points",
    subtitle: "Every order earns you loyalty points. Redeem for free drinks, discounts, and exclusive perks.",
    icon: "award",
    image: require("@/assets/images/mojito.png"),
  },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const topPad = Platform.OS === "web" ? 60 : insets.top;
  const bottomPad = Platform.OS === "web" ? 40 : insets.bottom;

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      const next = activeIndex + 1;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setActiveIndex(next);
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem("hasSeenOnboarding", "true");
    router.replace("/login");
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem("hasSeenOnboarding", "true");
    router.replace("/(tabs)");
  };

  const isLast = activeIndex === SLIDES.length - 1;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(s) => s.id}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item: slide }) => (
          <View style={[styles.slide, { width }]}>
            <Image source={slide.image} style={styles.slideImage} resizeMode="cover" />
            <View style={[styles.imageOverlay, { backgroundColor: colors.background + "CC" }]} />
            <View style={[styles.slideContent, { paddingBottom: bottomPad + 130 }]}>
              <View style={[styles.iconCircle, { backgroundColor: colors.goldDim, borderColor: colors.gold + "55" }]}>
                <Feather name={slide.icon as any} size={30} color={colors.gold} />
              </View>
              <Text style={[styles.slideTitle, { color: colors.ivory }]}>{slide.title}</Text>
              <Text style={[styles.slideSub, { color: colors.mutedForeground }]}>{slide.subtitle}</Text>
            </View>
          </View>
        )}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(idx);
        }}
      />

      <View style={[styles.topBar, { paddingTop: topPad + 8 }]}>
        <LogoBrand variant="mini" />
        {!isLast && (
          <Pressable onPress={handleSkip} hitSlop={12}>
            <Text style={[styles.skipText, { color: colors.mutedForeground }]}>Skip</Text>
          </Pressable>
        )}
      </View>

      <View style={[styles.bottomBar, { paddingBottom: bottomPad + 24 }]}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  width: i === activeIndex ? 28 : 7,
                  backgroundColor: i === activeIndex ? colors.gold : colors.border,
                },
              ]}
            />
          ))}
        </View>

        <Pressable onPress={handleNext} style={[styles.nextBtn, { backgroundColor: colors.gold }]}>
          <Text style={styles.nextBtnText}>{isLast ? "Get Started" : "Next"}</Text>
          <Feather name={isLast ? "check" : "arrow-right"} size={18} color="#0D3321" />
        </Pressable>

        {isLast && (
          <Pressable onPress={handleSkip} style={styles.skipRow}>
            <Text style={[styles.skipLoginText, { color: colors.mutedForeground }]}>Skip for now</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  slide: { flex: 1, height },
  slideImage: { ...StyleSheet.absoluteFillObject as any, width: "100%", height: "100%" },
  imageOverlay: { ...StyleSheet.absoluteFillObject as any },
  slideContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 30,
    paddingBottom: 160,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  slideTitle: {
    fontSize: 38,
    fontWeight: "900",
    lineHeight: 46,
    letterSpacing: -0.5,
    marginBottom: 14,
  },
  slideSub: { fontSize: 15, lineHeight: 24, maxWidth: "90%" },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  skipText: { fontSize: 14, fontWeight: "500" },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 24, gap: 16 },
  dotsRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { height: 7, borderRadius: 4 },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 18,
    paddingVertical: 17,
  },
  nextBtnText: { fontSize: 16, fontWeight: "800", color: "#0D3321" },
  skipRow: { alignItems: "center" },
  skipLoginText: { fontSize: 14 },
});
