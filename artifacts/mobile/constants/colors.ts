/**
 * Temptations Cafe brand palette
 * From official brand guide:
 *  - Greens:  #021A0D (950), #052A16 (900), #0A4424 (800), #135A30 (700)
 *  - Golds:   #F0CC8D (300), #DDB56C (400), #C79A4E (500), #A87B38 (600)
 *  - Ivory:   #FAF6EC (50),  #F4F1E5 (100), #F3E8D2 (200)
 *  - Ink:     #1C1610 (900)
 */
const colors = {
  light: {
    /* ── Core ── */
    text: "#1C1610",
    tint: "#C79A4E",
    background: "#FAF6EC",
    foreground: "#1C1610",
    card: "#F4F1E5",
    cardForeground: "#1C1610",
    primary: "#C79A4E",
    primaryForeground: "#FAF6EC",
    secondary: "#F3E8D2",
    secondaryForeground: "#1C1610",
    muted: "#EDE8DC",
    mutedForeground: "#7A7066",
    accent: "#C79A4E",
    accentForeground: "#FAF6EC",
    destructive: "#C62828",
    destructiveForeground: "#FAF6EC",
    border: "#E5DDD0",
    input: "#E5DDD0",

    /* ── Brand gold palette ── */
    gold: "#C79A4E",
    goldLight: "#DDB56C",
    goldDim: "rgba(199,154,78,0.18)",

    /* ── Brand green palette ── */
    emerald: "#135A30",
    emeraldLight: "#1A7A42",
    emeraldDim: "rgba(19,90,48,0.15)",

    /* ── Surfaces ── */
    ivory: "#FAF6EC",
    surface: "rgba(28,22,16,0.04)",
    surfaceHover: "rgba(28,22,16,0.08)",
    secondary2: "#F3E8D2",
    cardElevated: "#EDE5D5",
  },
  dark: {
    text: "#FAF6EC",
    tint: "#F0CC8D",

    /* ── Core surfaces ── */
    background: "#052A16",   /* green-900 — primary dark bg */
    foreground: "#FAF6EC",   /* ivory-50 */
    card: "#0A4424",         /* green-800 */
    cardForeground: "#FAF6EC",
    cardElevated: "#0F4D2B",

    /* ── Brand primaries ── */
    primary: "#F0CC8D",      /* gold-300 */
    primaryForeground: "#052A16",
    secondary: "#021A0D",    /* green-950 */
    secondaryForeground: "#FAF6EC",

    /* ── Neutrals ── */
    muted: "#021A0D",
    mutedForeground: "#87A893",

    /* ── Accents ── */
    accent: "#DDB56C",
    accentForeground: "#052A16",

    /* ── Gold palette ── */
    gold: "#F0CC8D",
    goldLight: "#DDB56C",
    goldDim: "rgba(240,204,141,0.16)",

    /* ── Emerald palette ── */
    emerald: "#135A30",
    emeraldLight: "#1A7A42",
    emeraldDim: "rgba(26,122,66,0.2)",

    /* ── UI ── */
    ivory: "#FAF6EC",
    border: "#135A30",
    input: "#135A30",
    destructive: "#C62828",
    destructiveForeground: "#FAF6EC",
    surface: "rgba(250,246,236,0.04)",
    surfaceHover: "rgba(250,246,236,0.08)",
    secondary2: "#021A0D",
  },
  radius: 14,
};

export default colors;
