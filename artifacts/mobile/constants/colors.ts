/**
 * Temptations Cafe brand palette
 * Extracted from official logo:
 *  - Deep Forest Green background: #0D3321
 *  - Antique Gold accent: #C8A028
 *  - Ivory / Cream text: #F5F0E8
 */
const colors = {
  light: {
    text: "#0D3321",
    tint: "#C8A028",
    background: "#F5F0E8",
    foreground: "#0D3321",
    card: "#EDEAE2",
    cardForeground: "#0D3321",
    primary: "#C8A028",
    primaryForeground: "#0D3321",
    secondary: "#D4E8DC",
    secondaryForeground: "#0D3321",
    muted: "#E0DDD6",
    mutedForeground: "#5A7A67",
    accent: "#D4AF37",
    accentForeground: "#0D3321",
    destructive: "#C62828",
    destructiveForeground: "#ffffff",
    border: "#C8C0A8",
    input: "#C8C0A8",
    gold: "#C8A028",
    goldLight: "#D4AF37",
    goldDim: "rgba(200,160,40,0.15)",
    emerald: "#1A5C38",
    emeraldLight: "#2D8A56",
    emeraldDim: "rgba(45,138,86,0.15)",
    ivory: "#F5F0E8",
    surface: "rgba(13,51,33,0.05)",
    surfaceHover: "rgba(13,51,33,0.08)",
    secondary2: "#D4E8DC",
    cardElevated: "#E5E0D8",
  },
  dark: {
    text: "#F5F0E8",
    tint: "#C8A028",
    /* ── Core surfaces (matched to logo) ── */
    background: "#0D3321",   /* deep forest green — logo bg */
    foreground: "#F5F0E8",   /* ivory cream */
    card: "#0F3D27",         /* slightly lighter forest green */
    cardForeground: "#F5F0E8",
    cardElevated: "#133F2A", /* elevated cards */
    /* ── Brand primaries ── */
    primary: "#C8A028",      /* antique gold — logo gold */
    primaryForeground: "#0D3321",
    secondary: "#0A2C1C",    /* deeper forest green */
    secondaryForeground: "#F5F0E8",
    /* ── Neutrals ── */
    muted: "#0A2C1C",
    mutedForeground: "#7AAD8A", /* muted sage green */
    /* ── Accents ── */
    accent: "#D4AF37",       /* bright gold highlight */
    accentForeground: "#0D3321",
    /* ── Gold palette ── */
    gold: "#C8A028",
    goldLight: "#D4AF37",
    goldDim: "rgba(200,160,40,0.14)",
    /* ── Emerald palette ── */
    emerald: "#1A4D30",
    emeraldLight: "#2D7A50",
    emeraldDim: "rgba(45,122,80,0.2)",
    /* ── UI ── */
    ivory: "#F5F0E8",
    border: "#1C4D30",
    input: "#1C4D30",
    destructive: "#C62828",
    destructiveForeground: "#ffffff",
    surface: "rgba(245,240,232,0.05)",
    surfaceHover: "rgba(245,240,232,0.08)",
    secondary2: "#0A2C1C",
  },
  radius: 14,
};

export default colors;
