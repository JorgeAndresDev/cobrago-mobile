import { ImageBackground, StyleSheet, View, Text, SafeAreaView } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useNetwork } from "../hooks/useNetwork";

interface BackgroundWrapperProps {
  children: React.ReactNode;
}

export default function BackgroundWrapper({ children }: BackgroundWrapperProps) {
  const { theme, colors } = useTheme();
  const { isConnected } = useNetwork();

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
        {!isConnected && (
          <SafeAreaView style={styles.offlineBanner}>
            <Text style={styles.offlineText}>⚠️ Sin conexión a internet</Text>
          </SafeAreaView>
        )}
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
  offlineBanner: {
    backgroundColor: "#ff4d4d",
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  offlineText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
