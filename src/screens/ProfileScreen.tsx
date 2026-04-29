import React, { useContext, useState } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  Switch, 
  Image, 
  ScrollView, 
  TextInput,
  ActivityIndicator
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import BackgroundWrapper from "../components/BackgroundWrapper";
import { createProfileStyles } from "../styles/profile.styles";
import Toast from "react-native-toast-message";
import { useNetwork } from "../hooks/useNetwork";

export default function ProfileScreen() {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme, colors } = useTheme();
  const { isConnected } = useNetwork();
  const styles = createProfileStyles(colors);
  const navigation = useNavigation<any>();

  const [notifications, setNotifications] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword) {
      Toast.show({
        type: 'error',
        text1: 'Campos incompletos',
        text2: 'Por favor ingresa tu contraseña actual y la nueva.'
      });
      return;
    }
    
    setIsUpdating(true);
    // Simular actualización
    setTimeout(() => {
      setIsUpdating(false);
      Toast.show({
        type: 'success',
        text1: 'Contraseña actualizada',
        text2: 'Tu seguridad es nuestra prioridad.'
      });
      setCurrentPassword("");
      setNewPassword("");
    }, 1500);
  };

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* 1. Header & Avatar */}
          <View style={styles.header}>
            <View style={[styles.avatarLarge, { backgroundColor: colors.primary + "30" }]}>
              <Text style={styles.avatarText}>{user?.username?.substring(0, 1).toUpperCase()}</Text>
            </View>
            <Text style={styles.userName}>{user?.username}</Text>
            <View style={[styles.statusBadge, { backgroundColor: isConnected ? "rgba(74, 222, 128, 0.1)" : "rgba(255, 77, 77, 0.1)" }]}>
              <View style={[styles.statusDot, { backgroundColor: isConnected ? colors.success : "#ff4d4d" }]} />
              <Text style={[styles.statusText, { color: isConnected ? colors.success : "#ff4d4d" }]}>
                {isConnected ? "Conectado" : "Sin conexión"}
              </Text>
            </View>
          </View>

          {/* 2. Información del Usuario */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👤 Información del Usuario</Text>
            <View style={[styles.card, { backgroundColor: colors.bgDark, borderColor: colors.border }]}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nombre de Usuario</Text>
                <Text style={styles.infoValue}>{user?.username}</Text>
              </View>
              <View style={styles.infoRowLast}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email || "cobrador@cobrago.com"}</Text>
              </View>
            </View>
          </View>

          {/* 3. Cambiar Contraseña */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔐 Seguridad</Text>
            <View style={[styles.card, { backgroundColor: colors.bgDark, borderColor: colors.border }]}>
              <View style={styles.inputGroup}>
                <Text style={styles.infoLabel}>Contraseña Actual</Text>
                <TextInput 
                  style={[styles.input, { backgroundColor: colors.bgLight }]} 
                  secureTextEntry 
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="********"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.infoLabel}>Nueva Contraseña</Text>
                <TextInput 
                  style={[styles.input, { backgroundColor: colors.bgLight }]} 
                  secureTextEntry 
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Min. 8 caracteres"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              <TouchableOpacity 
                style={[styles.updateButton, { backgroundColor: colors.primary }]}
                onPress={handleUpdatePassword}
                disabled={isUpdating}
              >
                {isUpdating ? <ActivityIndicator color="#fff" /> : <Text style={styles.updateButtonText}>Actualizar Contraseña</Text>}
              </TouchableOpacity>
            </View>
          </View>

          {/* 4. Preferencias */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚙️ Preferencias</Text>
            <View style={[styles.card, { backgroundColor: colors.bgDark, borderColor: colors.border }]}>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Modo Oscuro</Text>
                <Switch 
                  value={theme === "dark"} 
                  onValueChange={toggleTheme}
                  trackColor={{ false: "#cbd5e1", true: colors.success }}
                  thumbColor={"#fff"}
                />
              </View>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Notificaciones</Text>
                <Switch 
                  value={notifications} 
                  onValueChange={setNotifications}
                  trackColor={{ false: "#cbd5e1", true: colors.success }}
                  thumbColor={"#fff"}
                />
              </View>
              <TouchableOpacity 
                style={styles.settingRowLast}
                onPress={() => navigation.navigate("Help")}
              >
                <Text style={styles.settingLabel}>Centro de Ayuda</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 18 }}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 5. Cerrar Sesión */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
              <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Logo */}
          <View style={styles.footerLogo}>
            <Image 
              source={require("../../assets/logo-cobrago.png")} 
              style={{ width: 60, height: 60, resizeMode: 'contain' }}
            />
            <Text style={[styles.versionText, { color: colors.textSecondary }]}>CobraGo v1.0.0</Text>
          </View>

        </ScrollView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}
