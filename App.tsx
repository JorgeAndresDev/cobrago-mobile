import React from "react";
import { AuthProvider } from "./src/context/AuthContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { StatusBar } from "expo-status-bar";
import Toast from 'react-native-toast-message';
import BackgroundWrapper from "./src/components/BackgroundWrapper";

export default function App() {
  return (
    <ThemeProvider>
      <BackgroundWrapper>
        <AuthProvider>
          <StatusBar style="auto" />
          <AppNavigator />
          <Toast />
        </AuthProvider>
      </BackgroundWrapper>
    </ThemeProvider>
  );
}