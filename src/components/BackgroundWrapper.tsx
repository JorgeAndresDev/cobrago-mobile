import React from "react";
import { ImageBackground, StyleSheet, View, StatusBar } from "react-native";
import { useTheme } from "../context/ThemeContext";

interface BackgroundWrapperProps {
  children: React.ReactNode;
}

export default function BackgroundWrapper({ children }: BackgroundWrapperProps) {
  const { theme } = useTheme();

  // Use the generated images based on the current theme
  const backgroundImage = theme === "dark" 
    ? require("../assets/jungle_dark.png") 
    : require("../assets/jungle_light.png");

  return (
    <ImageBackground 
      source={backgroundImage} 
      style={styles.background}
      resizeMode="cover"
    >
      <View style={[
        styles.overlay, 
        { backgroundColor: theme === "dark" ? "rgba(7, 42, 30, 0.4)" : "rgba(255, 255, 255, 0.3)" }
      ]}>
        {children}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
  },
});
