import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

/**
 * Central responsive-layout hook.
 * Re-evaluates whenever the window is resized (web) or orientation changes.
 *
 * Design baseline: 390 × 844 (iPhone 14).
 */
export function useLayout() {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const isSmallPhone = width < 360;
    const isLargePhone = width >= 480;
    const isTablet = width >= 600;

    /* ── Scale factor relative to 390px baseline ── */
    const scaleRatio = width / 390;
    const fs = (base: number) =>
      Math.max(base * 0.82, Math.min(base * 1.3, scaleRatio * base));
    const sp = (base: number) =>
      Math.max(base * 0.82, Math.min(base * 1.35, scaleRatio * base));

    /* ── Layout tokens ── */
    const hp = isTablet ? 32 : isSmallPhone ? 14 : 20;       // horizontal padding
    const contentW = isTablet ? Math.min(width, 680) : width; // center on wide screens
    const contentPadL = isTablet ? (width - contentW) / 2 : 0;

    /* ── Hero image height ── */
    const heroH = Math.max(isSmallPhone ? 280 : 340, Math.min(500, height * 0.44));

    /* ── Menu grid ── */
    const menuCols = isTablet ? 3 : 2;
    const menuGap = 12;
    const cardW =
      (contentW - hp * 2 - menuGap * (menuCols - 1)) / menuCols;

    /* ── Horizontal scroll card widths ── */
    const offerCardW = Math.min(260, width * 0.58);
    const eventCardW = Math.min(260, width * 0.6);

    /* ── Floor-map scaling (design canvas = 420 × 280) ── */
    const MAP_BASE_W = 420;
    const MAP_BASE_H = 280;
    const mapW = contentW - hp * 2 - 24;
    const mapScale = mapW / MAP_BASE_W;
    const mapH = MAP_BASE_H * mapScale;

    return {
      width,
      height,
      isSmallPhone,
      isLargePhone,
      isTablet,
      fs,
      sp,
      hp,
      contentW,
      contentPadL,
      heroH,
      menuCols,
      menuGap,
      cardW,
      offerCardW,
      eventCardW,
      MAP_BASE_W,
      MAP_BASE_H,
      mapW,
      mapH,
      mapScale,
    };
  }, [width, height]);
}
