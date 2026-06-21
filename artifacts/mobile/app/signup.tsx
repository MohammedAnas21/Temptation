import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import fonts from "@/constants/fonts";
import { useUser } from "@/contexts/UserContext";
import { useColors } from "@/hooks/useColors";
import { useLayout } from "@/hooks/useLayout";

export default function SignupScreen() {
  const colors = useColors();
  const layout = useLayout();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signup } = useUser();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const topPad = Platform.OS === "web" ? 60 : insets.top;
  const bottomPad = Platform.OS === "web" ? 40 : insets.bottom;

  const validate = () => {
    if (!name.trim()) {
      Alert.alert("Name Required", "Please enter your full name.");
      return false;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert("Valid Email Required", "Please enter a valid email address.");
      return false;
    }
    if (phone.replace(/\D/g, "").length < 10) {
      Alert.alert("Valid Mobile Required", "Please enter a valid 10-digit mobile number.");
      return false;
    }
    if (!password || password.length < 6) {
      Alert.alert("Password Too Short", "Password must be at least 6 characters.");
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert("Passwords Don't Match", "Please make sure both passwords match.");
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    const success = await signup(
      { name: name.trim(), email: email.trim().toLowerCase(), phone },
      password,
    );
    if (success) {
      router.replace("/(tabs)");
    } else {
      Alert.alert("Signup Failed", "Could not create your account. Please try again.");
    }
  };

  const inputProps = {
    placeholderTextColor: colors.mutedForeground,
    style: [styles.input, { color: colors.foreground, backgroundColor: colors.muted, borderColor: colors.border }],
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
        <Pressable onPress={() => router.back()} hitSlop={12} style={[styles.backBtn, { backgroundColor: colors.surface }]}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: topPad + 24,
          paddingBottom: bottomPad + 24,
          paddingHorizontal: 20,
          maxWidth: layout.contentW,
          width: "100%",
          alignSelf: "center",
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoWrap}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={[styles.logoSub, { color: colors.mutedForeground }]}>Kalaburagi's Finest</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card + "F0", borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Create Account</Text>
          <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
            Enter your details to get started
          </Text>

          <TextInput
            {...inputProps}
            placeholder="Full name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <TextInput
            {...inputProps}
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={[styles.phoneRow, { borderColor: colors.border, backgroundColor: colors.muted }]}>
            <View style={[styles.flag, { borderRightColor: colors.border }]}>
              <Text style={styles.flagText}>🇮🇳 +91</Text>
            </View>
            <TextInput
              style={[styles.phoneInput, { color: colors.foreground }]}
              placeholder="Mobile number"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <View style={[styles.passwordRow, { borderColor: colors.border, backgroundColor: colors.muted }]}>
            <TextInput
              style={[styles.passwordInput, { color: colors.foreground }]}
              placeholder="Password"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <Pressable onPress={() => setShowPassword((s) => !s)} style={styles.eyeBtn}>
              <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <View style={[styles.passwordRow, { borderColor: colors.border, backgroundColor: colors.muted }]}>
            <TextInput
              style={[styles.passwordInput, { color: colors.foreground }]}
              placeholder="Confirm password"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry={!showConfirm}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <Pressable onPress={() => setShowConfirm((s) => !s)} style={styles.eyeBtn}>
              <Feather name={showConfirm ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <Pressable onPress={handleSignup} style={[styles.primaryBtn, { backgroundColor: colors.gold }]}>
            <Text style={styles.primaryBtnText}>Sign Up</Text>
            <Feather name="arrow-right" size={18} color="#000" />
          </Pressable>

          <Pressable onPress={() => router.push("/login")} style={styles.switchRow}>
            <Text style={[styles.switchText, { color: colors.mutedForeground }]}>
              Already have an account? <Text style={{ color: colors.gold }}>Sign In</Text>
            </Text>
          </Pressable>
        </View>

        <View style={[styles.bottomNote, { paddingBottom: bottomPad + 16 }]}>
          <Text style={[styles.bottomNoteText, { color: colors.mutedForeground }]}>
            By signing up, you agree to our Terms & Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bgImage: { ...StyleSheet.absoluteFillObject as any, width: "100%", height: "100%" },
  bgOverlay: {
    ...StyleSheet.absoluteFillObject as any,
    backgroundColor: "rgba(5,42,22,0.88)",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  logoWrap: { alignItems: "center", paddingBottom: 24 },
  logoImage: { width: 140, height: 140, borderRadius: 20 },
  logoSub: { fontSize: 13, marginTop: 8, fontFamily: fonts.script, fontStyle: "italic" },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
  },
  cardTitle: { fontSize: 24, fontFamily: fonts.display[900], marginBottom: 6 },
  cardSub: { fontSize: 14, fontFamily: fonts.body[400], lineHeight: 20, marginBottom: 24 },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: fonts.body[400],
    marginBottom: 14,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 14,
  },
  flag: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRightWidth: 1,
  },
  flagText: { fontSize: 14, fontFamily: fonts.body[600] },
  phoneInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 14, fontSize: 15, fontFamily: fonts.body[400] },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
    paddingRight: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: fonts.body[400],
  },
  eyeBtn: { padding: 6 },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 14,
    paddingVertical: 15,
    marginBottom: 16,
  },
  primaryBtnText: { fontSize: 16, fontFamily: fonts.body[800], color: "#052A16" },
  switchRow: { alignItems: "center" },
  switchText: { fontSize: 14, fontFamily: fonts.body[400] },
  bottomNote: { alignItems: "center", paddingTop: 20 },
  bottomNoteText: { fontSize: 11, fontFamily: fonts.body[400], textAlign: "center" },
});
