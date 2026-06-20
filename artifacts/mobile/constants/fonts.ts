/**
 * Temptations Cafe brand typography
 *
 * Display / Headings → Fraunces  (serif / display)
 * Body text          → Work Sans (sans-serif)
 * Script tagline     → Mrs Saint Delafield (script, decorative only)
 * Utility / Prices   → Space Mono (monospace)
 *
 * Font file names from @expo-google-fonts:
 *   Fraunces            → Fraunces_<weight><style>
 *   WorkSans            → WorkSans_<weight><style>
 *   SpaceMono           → SpaceMono_<weight><style>
 *   MrsSaintDelafield   → MrsSaintDelafield_400Regular
 */

export const fonts = {
  /* ── Display / Headings (Fraunces) ── */
  display: {
    400: "Fraunces_400Regular" as const,
    500: "Fraunces_500Medium" as const,
    600: "Fraunces_600SemiBold" as const,
    700: "Fraunces_700Bold" as const,
    800: "Fraunces_800ExtraBold" as const,
    900: "Fraunces_900Black" as const,
  },

  /* ── Body (Work Sans) ── */
  body: {
    400: "WorkSans_400Regular" as const,
    500: "WorkSans_500Medium" as const,
    600: "WorkSans_600SemiBold" as const,
    700: "WorkSans_700Bold" as const,
    800: "WorkSans_800ExtraBold" as const,
  },

  /* ── Mono / Utility (Space Mono) – prices, codes ── */
  mono: {
    400: "SpaceMono_400Regular" as const,
    700: "SpaceMono_700Bold" as const,
  },

  /* ── Script tagline (Mrs Saint Delafield – decorative only) ── */
  script: "MrsSaintDelafield_400Regular" as const,

  /**
   * Helper: pick the right font weight from the display family.
   * Use `fontFamily: fonts.display[900]` for extra-bold headings.
   */
} as const;

export default fonts;
