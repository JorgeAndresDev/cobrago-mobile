import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import Toast from "react-native-toast-message";
import { AuthContext } from "../context/AuthContext";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../context/ThemeContext";
import BackgroundWrapper from "../components/BackgroundWrapper";
import { createLoginStyles } from "../styles/login.styles";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const { login } = useContext(AuthContext);
  const { colors, theme } = useTheme();
  const styles = createLoginStyles(colors, theme);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Por favor completa todos los campos",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (error: any) {
      let msg = "Error al iniciar sesión.";
      if (error.response?.status === 401) {
        msg = "Correo o contraseña incorrectos. Verifica tus datos.";
      } else if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        msg = typeof detail === "string" ? detail : JSON.stringify(detail);
      }

      Toast.show({
        type: "error",
        text1: "Error de Acceso",
        text2: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BackgroundWrapper>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo / Header */}
          <View style={styles.header}>
            <Image
              source={require("../../assets/logo-cobrago.png")}
              style={styles.logo}
            />
          </View>

          {/* Form card */}
          <View style={styles.content}>
            <View style={[styles.form, { backgroundColor: colors.bgDark }]}>
              <Text style={[styles.formTitle, { color: colors.textPrimary }]}>
                Iniciar Sesión
              </Text>

              {/* Email */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Correo Electrónico</Text>
                <TextInput
                  placeholder="tu@ejemplo.com"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={setEmail}
                  style={[styles.input, { color: colors.textPrimary }]}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>

              {/* Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Contraseña</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    placeholder="••••••••"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    style={[
                      styles.input,
                      styles.passwordInput,
                      { color: colors.textPrimary },
                    ]}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword((prev) => !prev)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={22}
                      color="#94a3b8"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Submit */}
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: colors.primary, shadowColor: colors.success },
                  isSubmitting && styles.buttonDisabled,
                ]}
                onPress={handleLogin}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Entrar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BackgroundWrapper>
  );
}