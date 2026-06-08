import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Icon } from "../components/Icon";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

type ToastProps = {
  text1?: string;
  text2?: string;
};

const ToastBase = ({
  text1,
  text2,
  color,
  iconName,
}: ToastProps & { color: string; iconName: string }) => {
  const { colors, theme } = useTheme();
  
  // Ajustamos el fondo según el tema
  const bgColor = theme === 'dark' ? "#051c14" : "#ffffff";
  const shadowOpacity = theme === 'dark' ? 0.5 : 0.15;
  const textColor = theme === 'dark' ? "#ffffff" : "#0f172a";
  const secondaryTextColor = theme === 'dark' ? "rgba(255, 255, 255, 0.7)" : "#64748b";

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: bgColor, 
        borderLeftColor: color,
        borderColor: theme === 'dark' ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
        shadowOpacity: shadowOpacity
      }
    ]}>
      <View style={[styles.glow, { backgroundColor: color, opacity: theme === 'dark' ? 0.5 : 0.2 }]} />
      <View style={[styles.iconBox, { backgroundColor: color + "15" }]}>
        <Icon name={iconName} size={20} color={color} />
      </View>
      <View style={styles.textBox}>
        {text1 && <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>{text1}</Text>}
        {text2 && <Text style={[styles.message, { color: secondaryTextColor }]} numberOfLines={2}>{text2}</Text>}
      </View>
    </View>
  );
};

export const toastConfig = {
  success: ({ text1, text2 }: ToastProps) => (
    <ToastBase
      text1={text1}
      text2={text2}
      color="#4ade80"
      iconName="check-circle"
    />
  ),
  error: ({ text1, text2 }: ToastProps) => (
    <ToastBase
      text1={text1}
      text2={text2}
      color="#ff4757"
      iconName="alert-circle"
    />
  ),
  info: ({ text1, text2 }: ToastProps) => (
    <ToastBase
      text1={text1}
      text2={text2}
      color="#00d2ff"
      iconName="info"
    />
  ),
  warning: ({ text1, text2 }: ToastProps) => (
    <ToastBase
      text1={text1}
      text2={text2}
      color="#ffa502"
      iconName="alert-circle"
    />
  ),
};

const styles = StyleSheet.create({
  container: {
    width: width * 0.9,
    borderLeftWidth: 4,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 15,
    elevation: 10,
    marginTop: 10,
    borderWidth: 1,
  },
  glow: {
    position: "absolute",
    left: -4,
    top: 20,
    bottom: 20,
    width: 2,
    borderRadius: 10,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  textBox: {
    flex: 1,
  },
  title: {
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
});
