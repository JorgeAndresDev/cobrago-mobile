import React, { useEffect } from "react";
import { AuthProvider } from "./src/context/AuthContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { StatusBar } from "expo-status-bar";
import Toast from 'react-native-toast-message';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { dbService } from "./src/services/dbService";
import ConnectivityIndicator from "./src/components/ConnectivityIndicator";
import { toastConfig } from "./src/utils/toastConfig";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";

export default function App() {
  const [isDbReady, setIsDbReady] = React.useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await dbService.initDb();
        setIsDbReady(true);
      } catch (error) {
        console.error("DB Init Error:", error);
      }
    };
    init();
  }, []);

  if (!isDbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Iniciando CobraGo...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <View style={styles.root}>
            <StatusBar style="auto" />
            <AppNavigator />
            <ConnectivityIndicator />
            <Toast config={toastConfig} />
          </View>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});