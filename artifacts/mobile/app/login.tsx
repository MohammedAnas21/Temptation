import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

type Step = "phone" | "otp";

export default function LoginScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(TextInput | null)[]>([]);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const topPad = Platform.OS === "web" ? 60 : insets.top;
  const bottomPad = Platform.OS === "web" ? 40 : insets.bottom;

  const transition = (fn: () => void) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      fn();
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  };

  const handleSendOTP = () => {
    if (phone.length < 10) {
      Alert.alert("Invalid Number", "Please enter a valid 10-digit mobile number.");
      return;
    }
    transition(() => setStep("otp"));
  };

  const handleVerifyOTP = () => {
    const code = otp.join("");
    if (code.length < 6) {
      Alert.alert("Incomplete OTP", "Please enter the full 6-digit OTP.");
      return;
    }
    handleLoginSuccess();
  };

  const handleLoginSuccess = async () => {
    await AsyncStorage.setItem("isLoggedIn", "true");
    router.replace("/(tabs)");
  };

  const handleOtpChange = (val: string, idx: number) => {
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (!val && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.root, { backgroundColor: colors.background }]}
    >
      <Image
        source={require("@/assets/images/ambience.png")}
        style={styles.bgImage}
        resizeMode="cover"
      />
      <View style={styles.bgOverlay} />

      <View style={[styles.topBar, { paddingTop: topPad + 8 }]}>
        <Pressable
          onPress={() => (step === "otp" ? transition(() => setStep("phone")) : router.back())}
          hitSlop={12}
          style={[styles.backBtn, { backgroundColor: colors.surface }]}
        >
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
      </View>

      <View style={[styles.logoWrap, { paddingTop: topPad + 60 }]}>
        <Text style={[styles.logoT, { color: colors.gold }]}>Temptations</Text>
        <Text style={[styles.logoC, { color: colors.ivory }]}>CAFE</Text>
        <Text style={[styles.logoSub, { color: colors.mutedForeground }]}>Kalaburagi's Finest</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card + "F0", borderColor: colors.border }]}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {step === "phone" ? (
            <>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Sign In</Text>
              <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
                Enter your mobile number to continue
              </Text>

              <View style={[styles.phoneRow, { borderColor: colors.border, backgroundColor: colors.muted }]}>
                <View style={[styles.flag, { borderRightColor: colors.border }]}>
                  <Text style={styles.flagText}>🇮🇳 +91</Text>
                </View>
                <TextInput
                  style={[styles.phoneInput, { color: colors.foreground }]}
                  placeholder="Enter mobile number"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              <Pressable
                onPress={handleSendOTP}
                style={[styles.primaryBtn, { backgroundColor: colors.gold }]}
              >
                <Text style={styles.primaryBtnText}>Send OTP</Text>
                <Feather name="arrow-right" size={18} color="#000" />
              </Pressable>

              <View style={styles.dividerRow}>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>or continue with</Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              </View>

              <View style={styles.socialRow}>
                <Pressable style={[styles.socialBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                  <Text style={styles.socialIcon}>🇬</Text>
                  <Text style={[styles.socialText, { color: colors.foreground }]}>Google</Text>
                </Pressable>
                {Platform.OS === "ios" && (
                  <Pressable style={[styles.socialBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                    <Feather name="smartphone" size={18} color={colors.foreground} />
                    <Text style={[styles.socialText, { color: colors.foreground }]}>Apple</Text>
                  </Pressable>
                )}
              </View>

              <Pressable onPress={() => router.replace("/(tabs)")} style={styles.skipRow}>
                <Text style={[styles.skipText, { color: colors.mutedForeground }]}>
                  Continue as Guest →
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Verify OTP</Text>
              <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
                Sent to +91 {phone}
              </Text>

              <View style={styles.otpRow}>
                {otp.map((digit, idx) => (
                  <TextInput
                    key={idx}
                    ref={(r) => { otpRefs.current[idx] = r; }}
                    style={[
                      styles.otpBox,
                      {
                        backgroundColor: digit ? colors.goldDim : colors.muted,
                        borderColor: digit ? colors.gold : colors.border,
                        color: colors.foreground,
                      },
                    ]}
                    maxLength={1}
                    keyboardType="number-pad"
                    value={digit}
                    onChangeText={(v) => handleOtpChange(v, idx)}
                    textAlign="center"
                  />
                ))}
              </View>

              <Pressable
                onPress={handleVerifyOTP}
                style={[styles.primaryBtn, { backgroundColor: colors.gold }]}
              >
                <Text style={styles.primaryBtnText}>Verify & Login</Text>
                <Feather name="check" size={18} color="#000" />
              </Pressable>

              <Pressable onPress={handleSendOTP} style={styles.resendRow}>
                <Text style={[styles.resendText, { color: colors.mutedForeground }]}>
                  Didn't receive? <Text style={{ color: colors.gold }}>Resend OTP</Text>
                </Text>
              </Pressable>
            </>
          )}
        </Animated.View>
      </View>

      <View style={[styles.bottomNote, { paddingBottom: bottomPad + 16 }]}>
        <Text style={[styles.bottomNoteText, { color: colors.mutedForeground }]}>
          By continuing, you agree to our Terms & Privacy Policy
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bgImage: { ...StyleSheet.absoluteFillObject as any, width: "100%", height: "100%" },
  bgOverlay: {
    ...StyleSheet.absoluteFillObject as any,
    backgroundColor: "rgba(7,15,12,0.88)",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  logoWrap: {
    alignItems: "center",
    paddingBottom: 32,
  },
  logoT: { fontSize: 28, fontWeight: "900" },
  logoC: { fontSize: 16, fontWeight: "700", letterSpacing: 4 },
  logoSub: { fontSize: 13, marginTop: 4 },
  card: {
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
  },
  cardTitle: { fontSize: 24, fontWeight: "900", marginBottom: 6 },
  cardSub: { fontSize: 14, lineHeight: 20, marginBottom: 24 },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 16,
  },
  flag: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRightWidth: 1,
  },
  flagText: { fontSize: 14, fontWeight: "600" },
  phoneInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 14, fontSize: 16 },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 14,
    paddingVertical: 15,
    marginBottom: 20,
  },
  primaryBtnText: { fontSize: 16, fontWeight: "800", color: "#000" },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 12 },
  socialRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 13,
  },
  socialIcon: { fontSize: 18 },
  socialText: { fontSize: 14, fontWeight: "600" },
  skipRow: { alignItems: "center" },
  skipText: { fontSize: 14 },
  otpRow: { flexDirection: "row", gap: 8, justifyContent: "center", marginBottom: 24 },
  otpBox: {
    width: 46,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    fontSize: 22,
    fontWeight: "800",
  },
  resendRow: { alignItems: "center" },
  resendText: { fontSize: 13 },
  bottomNote: { alignItems: "center", paddingTop: 20 },
  bottomNoteText: { fontSize: 11, textAlign: "center" },
});
