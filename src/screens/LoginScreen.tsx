import React, { useContext, useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Image
} from "react-native";
import Toast from "react-native-toast-message";
import { AuthContext } from "../context/AuthContext";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../context/ThemeContext";
import BackgroundWrapper from "../components/BackgroundWrapper";
import { createLoginStyles } from "../styles/login.styles";

export default function LoginScreen() {
  const { login } = useContext(AuthContext);
  const { colors, theme } = useTheme();
  const styles = createLoginStyles(colors, theme);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Por favor completa todos los campos'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (error: any) {
      let msg = "Error al iniciar sesión.";
      if (error.response?.status === 401) {
        msg = "Correo o contraseña incorrectos. Por favor, verifica tus datos.";
      } else if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        msg = typeof detail === 'string' ? detail : JSON.stringify(detail);
      }
      
      Toast.show({
        type: 'error',
        text1: 'Error de Acceso',
        text2: msg
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BackgroundWrapper>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <StatusBar style="light" />
        <View style={styles.header}>
          <Image 
            source={require("../../assets/logo-cobrago.png")} 
            style={styles.logo}
          />
        </View>

        <View style={styles.content}>
          <View style={[styles.form, { backgroundColor: colors.bgDark }]}>
            <Text style={[styles.formTitle, { color: colors.textPrimary }]}>Iniciar Sesión</Text>
            
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
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                placeholder="********"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={[styles.input, { color: colors.textPrimary }]}
              />
            </View>

            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.primary, shadowColor: colors.success }, isSubmitting && styles.buttonDisabled]} 
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
      </KeyboardAvoidingView>
    </BackgroundWrapper>
  );
}