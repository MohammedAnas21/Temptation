import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import fonts from "@/constants/fonts";
import { useColors } from "@/hooks/useColors";

type Variant = "full" | "header" | "mini";

export function LogoBrand({ variant = "header" }: { variant?: Variant }) {
  const colors = useColors();

  if (variant === "full") {
    return (
      <View style={styles.fullWrap}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.fullImage}
          resizeMode="contain"
        />
      </View>
    );
  }

  if (variant === "mini") {
    return (
      <View style={styles.miniWrap}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.miniImage}
          resizeMode="contain"
        />
        <View>
          <Text style={[styles.miniName, { color: colors.gold }]}>TEMPTATIONS</Text>
          <Text style={[styles.miniTagline, { color: colors.mutedForeground }]}>
            Taste Of Happiness
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.headerWrap}>
      <Image
        source={require("@/assets/images/logo.png")}
        style={styles.headerIcon}
        resizeMode="contain"
      />
      <View>
        <Text style={[styles.headerName, { color: colors.gold }]}>TEMPTATIONS</Text>
        <Text style={[styles.headerTagline, { color: colors.mutedForeground }]}>
          Taste Of Happiness
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  fullImage: {
    width: 260,
    height: 260,
    borderRadius: 20,
  },
  miniWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  miniImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  miniName: {
    fontSize: 14,
    fontFamily: fonts.display[900],
    letterSpacing: 2,
  },
  miniTagline: {
    fontSize: 12,
    fontFamily: fonts.script,
    letterSpacing: 0.3,
  },
  headerWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  headerName: {
    fontSize: 16,
    fontFamily: fonts.display[900],
    letterSpacing: 2.5,
  },
  headerTagline: {
    fontSize: 13,
    fontFamily: fonts.script,
    letterSpacing: 0.3,
  },
});
