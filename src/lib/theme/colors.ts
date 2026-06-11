/**
 * Chefie design tokens — keep in sync with CSS variables in globals.css
 */
export const colors = {
  primary: "#F57C00",
  primaryDark: "#E65100",
  primaryLight: "#FFB74D",

  secondary: "#8D6E63",
  secondaryDark: "#6D4C41",
  secondaryLight: "#EFEBE9",

  background: "#FFFDF8",
  surface: "#FFFDF9",
  foreground: "#2F241D",
  muted: "#6B5E55",

  border: "#F4E3C3",
  borderSubtle: "#F8ECD6",

  cardBg: "#FFFDFC",
  cardHover: "#FFF8EE",

  iconBg: "#FFF3DA",
  iconColor: "#F57C00",

  navActiveBg: "#FFF1D6",
  navHoverBg: "#FFF8EA",
  navInactive: "#4E433C",

  loginBorder: "#F5B14A",

  error: "#D32F2F",
  errorDark: "#B71C1C",
  errorLight: "#FFEBEE",

  warning: "#F57C00",
  warningDark: "#E65100",
  warningLight: "#FFF3E0",

  bgGradientFrom: "#FFF8E8",
  bgGradientMid: "#FFF3D6",
  bgGradientTo: "#FFE9B8",
  bgDecor: "rgba(255, 183, 77, 0.9)",

  uiGradientNav:
    "linear-gradient(180deg, rgba(255,253,248,0.94) 0%, rgba(255,250,242,0.92) 100%)",
  uiGradientCard:
    "linear-gradient(145deg, #FFFBF0 0%, #FFF6E4 50%, #FFF0D4 100%)",
  uiGradientBtnPrimary: "#F57C00",
  uiGradientBtnSecondary: "#FFFDF8",
  logoColor: "#F57C00",

  shadowSoft: "0 8px 24px rgba(194, 138, 56, 0.08)",
  overlay: "rgba(51, 51, 51, 0.5)",
} as const;

export type ThemeColors = typeof colors;
