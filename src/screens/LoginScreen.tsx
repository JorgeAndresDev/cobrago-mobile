import React, { useContext, useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator 
} from "react-native";
import Toast from "react-native-toast-message";
import { AuthContext } from "../context/AuthContext";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../context/ThemeContext";
import { Colors } from "../theme/colors";

export default function LoginScreen() {
  const { login } = useContext(AuthContext);
  const { colors } = useTheme();

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
      const detail = error.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : JSON.stringify(detail) || "Error al iniciar sesión.";
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
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: 'transparent' }]}
    >
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.success }]}>CobraGo</Text>
        <Text style={styles.subtitle}>Gestión de Préstamos Inteligente</Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 100,
    paddingBottom: 40,
    alignItems: "center",
  },
  content: {
    paddingHorizontal: 25,
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: "#94a3b8",
    marginTop: 5,
  },
  form: {
    padding: 30,
    borderRadius: 20, // 20px card
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.1)", // Sutil neon border
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 25,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#cbd5e1",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    borderWidth: 1,
    borderColor: "#334155",
    padding: 15,
    borderRadius: 14, // 14px elements
    fontSize: 16,
  },
  button: {
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  }
});