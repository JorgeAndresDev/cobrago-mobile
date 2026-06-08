import { ImageBackground, StyleSheet, View, Text } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useNetwork } from "../hooks/useNetwork";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface BackgroundWrapperProps {
  children: React.ReactNode;
}

export default function BackgroundWrapper({ children }: BackgroundWrapperProps) {
  const { theme, colors } = useTheme();
  const { isConnected } = useNetwork();

  const backgroundImage = theme === "dark" 
    ? require("../assets/jungle_dark.jpg") 
    : require("../assets/jungle_light.jpg");

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
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>⚠️ Sin conexión a internet</Text>
          </View>
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
    // Un pequeño margen para que no choque con el notch si aparece
    paddingTop: 10, 
  },
  offlineText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
