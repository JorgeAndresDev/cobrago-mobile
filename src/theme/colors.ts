export const lightColors = {
  // Emerald & Light Palette
  primary: "#125540",
  secondary: "#ffffff",
  accent: "#f59e0b",
  success: "#15803d", // Un verde un poco más oscuro para modo claro
  
  // Backgrounds
  bgLight: "#f8fafc",
  bgDark: "#f1f5f9",
  bgCard: "#ffffff",
  
  // Text
  textPrimary: "#0f172a",
  textSecondary: "#475569",
  textLight: "#ffffff", // Para texto dentro de botones primarios
  
  // UI Elements
  border: "#e2e8f0",
};

export const darkColors = {
  // Emerald & Dark Slate Palette
  primary: "#125540",
  secondary: "#072a1e",
  accent: "#f59e0b",
  success: "#4ade80",
  
  // Backgrounds
  bgLight: "#1e293b",
  bgDark: "#0f172a",
  bgCard: "#1e293b",
  
  // Text
  textPrimary: "#f8fafc",
  textSecondary: "#94a3b8",
  textLight: "#ffffff",
  
  // UI Elements
  border: "#1e293b",
};

// Mantenemos esto por compatibilidad temporal si algo falla, pero idealmente se debe usar el hook
export const Colors = darkColors;
