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
import { DEMO_CREDENTIALS, useUser } from "@/contexts/UserContext";
import { useColors } from "@/hooks/useColors";
import { useLayout } from "@/hooks/useLayout";

export default function LoginScreen() {
  const colors = useColors();
  const layout = useLayout();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useUser();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const topPad = Platform.OS === "web" ? 60 : insets.top;
  const bottomPad = Platform.OS === "web" ? 40 : insets.bottom;

  const handleLogin = async () => {
    if (!identifier.trim()) {
      Alert.alert("Input Required", "Please enter your email or mobile number.");
      return;
    }
    if (!password) {
      Alert.alert("Password Required", "Please enter your password.");
      return;
    }
    const success = await login(identifier.trim(), password);
    if (success) {
      router.replace("/(tabs)");
    } else {
      Alert.alert("Login Failed", "Invalid credentials. Please check and try again.");
    }
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
          paddingTop: topPad + 32,
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
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Sign In</Text>
          <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
            Use your email or mobile number to sign in
          </Text>

          <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.muted }]}>
            <Feather name="user" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Email or mobile number"
              placeholderTextColor={colors.mutedForeground}
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.muted }]}>
            <Feather name="lock" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
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

          <Pressable onPress={handleLogin} style={[styles.primaryBtn, { backgroundColor: colors.gold }]}>
            <Text style={styles.primaryBtnText}>Sign In</Text>
            <Feather name="arrow-right" size={18} color="#000" />
          </Pressable>

          <Pressable onPress={() => router.push("/signup")} style={styles.switchRow}>
            <Text style={[styles.switchText, { color: colors.mutedForeground }]}>
              New here? <Text style={{ color: colors.gold }}>Create an account</Text>
            </Text>
          </Pressable>

          <View style={styles.demoBox}>
            <Text style={[styles.demoLabel, { color: colors.mutedForeground }]}>
              Try without signing up
            </Text>
            <Pressable
              onPress={() => {
                setIdentifier(DEMO_CREDENTIALS.email);
                setPassword(DEMO_CREDENTIALS.password);
              }}
              style={[styles.demoBtn, { borderColor: colors.border }]}
            >
              <Feather name="smartphone" size={14} color={colors.gold} />
              <Text style={[styles.demoBtnText, { color: colors.foreground }]}>
                Use demo account
              </Text>
            </Pressable>
            <Text style={[styles.demoHint, { color: colors.mutedForeground }]}>
              {DEMO_CREDENTIALS.email} / {DEMO_CREDENTIALS.password}
            </Text>
          </View>
        </View>

        <View style={[styles.bottomNote, { paddingBottom: bottomPad + 16 }]}>
          <Text style={[styles.bottomNoteText, { color: colors.mutedForeground }]}>
            By continuing, you agree to our Terms & Privacy Policy
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
  logoWrap: { alignItems: "center", paddingBottom: 32 },
  logoImage: { width: 160, height: 160, borderRadius: 20 },
  logoSub: { fontSize: 13, marginTop: 8, fontFamily: fonts.script, fontStyle: "italic" },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
  },
  cardTitle: { fontSize: 24, fontFamily: fonts.display[900], marginBottom: 6 },
  cardSub: { fontSize: 14, fontFamily: fonts.body[400], lineHeight: 20, marginBottom: 24 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
    paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
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
  demoBox: { marginTop: 20, alignItems: "center", gap: 8 },
  demoLabel: { fontSize: 12, fontFamily: fonts.body[400] },
  demoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  demoBtnText: { fontSize: 14, fontFamily: fonts.body[600] },
  demoHint: { fontSize: 11, fontFamily: fonts.body[400], textAlign: "center" },
});
