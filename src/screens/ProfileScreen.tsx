import React, { useContext, useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Switch, 
  Image, 
  ScrollView, 
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import BackgroundWrapper from "../components/BackgroundWrapper";
import { createProfileStyles } from "../styles/profile.styles";
import Toast from "react-native-toast-message";
import { useNetwork } from "../hooks/useNetwork";
import * as ImagePicker from 'expo-image-picker';
import { syncService } from "../services/syncService";
import { Icon } from "../components/Icon";
import api from "../api/axios";

// 🔹 Componentes auxiliares movidos fuera para evitar re-rendereos de teclado
const Section = ({ title, iconName, children, colors, styles }: any) => (
  <View style={styles.section}>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
      <Icon name={iconName} size={18} color={colors.success} style={{ marginRight: 8 }} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <View style={[styles.card, { backgroundColor: colors.bgDark, borderColor: colors.border }]}>
      {children}
    </View>
  </View>
);

const Row = ({ label, value, onPress, isLast, iconName, colors, styles }: any) => (
  <TouchableOpacity 
    style={[styles.infoRow, isLast && { borderBottomWidth: 0 }]} 
    onPress={onPress} 
    disabled={!onPress}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {iconName && <Icon name={iconName} size={16} color={colors.textSecondary} style={{ marginRight: 10 }} />}
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
    {value && <Text style={styles.infoValue}>{value}</Text>}
    {onPress && !value && <Icon name="chevron-right" size={16} color={colors.textSecondary} />}
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme, colors } = useTheme();
  const { isConnected } = useNetwork();
  const styles = createProfileStyles(colors);
  const navigation = useNavigation<any>();

  const [notifications, setNotifications] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [collectorPhoto, setCollectorPhoto] = useState<string | null>(null);

  const getInitials = (name: string) => {
    if (!name) return "CO";
    const parts = name.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({ type: 'error', text1: 'Permiso denegado' });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.5 });
    if (!result.canceled) {
      setCollectorPhoto(result.assets[0].uri);
    }
  };

  const handleSync = async () => {
    if (!isConnected) {
      Toast.show({ type: 'error', text1: 'Sin conexión', text2: 'No se puede sincronizar sin internet.' });
      return;
    }
    setIsSyncing(true);
    await syncService.syncAll();
    setTimeout(() => {
      setIsSyncing(false);
      Toast.show({ type: 'success', text1: 'Sincronizado', text2: 'Los datos están al día.' });
    }, 1000);
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Toast.show({ type: 'error', text1: 'Campos incompletos', text2: 'Por favor llena todos los campos.' });
      return;
    }

    if (newPassword.length < 8) {
      Toast.show({ type: 'error', text1: 'Contraseña muy corta', text2: 'Debe tener al menos 8 caracteres.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Error de coincidencia', text2: 'Las nuevas contraseñas no coinciden.' });
      return;
    }

    setIsUpdating(true);
    try {
      await api.put("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword
      });

      Toast.show({ type: 'success', text1: '¡Éxito!', text2: 'Contraseña actualizada correctamente.' });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      const msg = error.response?.data?.detail || "No se pudo actualizar la contraseña.";
      Toast.show({ type: 'error', text1: 'Error', text2: msg });
    } finally {
      setIsUpdating(false);
    }
  };



  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
          
          <View style={styles.header}>
            <TouchableOpacity onPress={pickImage} style={[styles.avatarLarge, { backgroundColor: colors.primary + "20" }]}>
              {collectorPhoto ? (
                <Image source={{ uri: collectorPhoto }} style={styles.avatarImg} />
              ) : (
                <Text style={styles.avatarText}>{getInitials(user?.username || "")}</Text>
              )}
            </TouchableOpacity>
            <Text style={styles.userName}>{user?.username || "Cobrador"}</Text>
            <View style={[styles.statusBadge, { backgroundColor: isConnected ? "rgba(74, 222, 128, 0.1)" : "rgba(255, 77, 77, 0.1)" }]}>
              <View style={[styles.statusDot, { backgroundColor: isConnected ? colors.success : "#ff4d4d" }]} />
              <Text style={[styles.statusText, { color: isConnected ? colors.success : "#ff4d4d" }]}>
                {isConnected ? "Conectado" : "Sin conexión"}
              </Text>
            </View>
          </View>

          <Section title="Mi Perfil" iconName="user" colors={colors} styles={styles}>
            <Row label="Nombre de Usuario" value={user?.username} iconName="person" colors={colors} styles={styles} />
            <Row label="Correo Electrónico" value={user?.email || "cobrador@cobrago.com"} iconName="mail" colors={colors} styles={styles} />
            <Row label="ID de Usuario" value={`#${user?.id}`} iconName="hash" isLast colors={colors} styles={styles} />
          </Section>

          <Section title="Seguridad y Acceso" iconName="lock" colors={colors} styles={styles}>
            <View style={styles.inputGroup}>
              <Text style={styles.infoLabel}>Contraseña Actual</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput 
                  style={[styles.input, { backgroundColor: colors.bgLight, flex: 1, color: colors.textPrimary }]} 
                  secureTextEntry={!showPassword} 
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="********"
                  placeholderTextColor={colors.textSecondary}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 15 }}>
                  <Icon name={showPassword ? "eye" : "eye-off"} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.infoLabel}>Nueva Contraseña</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.bgLight, color: colors.textPrimary }]} 
                secureTextEntry={!showPassword} 
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Mín. 8 caracteres"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.infoLabel}>Confirmar Nueva Contraseña</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.bgLight, color: colors.textPrimary }]} 
                secureTextEntry={!showPassword} 
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repite la contraseña"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
              />
            </View>
            <TouchableOpacity 
              style={[styles.updateButton, { backgroundColor: colors.primary }]}
              onPress={handleUpdatePassword}
              disabled={isUpdating}
            >
              {isUpdating ? <ActivityIndicator color="#fff" /> : <Text style={styles.updateButtonText}>Actualizar Contraseña ahora</Text>}
            </TouchableOpacity>
          </Section>

          <Section title="Información Personal" iconName="id-card" colors={colors} styles={styles}>
            <Row label="Cédula" value={user?.cedula || "N/A"} iconName="card" colors={colors} styles={styles} />
            <Row label="Email" value={user?.email || "N/A"} iconName="mail" colors={colors} styles={styles} />
            <Row label="Teléfono" value={user?.telefono || "N/A"} iconName="call" colors={colors} styles={styles} />
            <Row label="Username" value={user?.username || "N/A"} isLast iconName="at" colors={colors} styles={styles} />
          </Section>

          <Section title="Apariencia" iconName="color-palette" colors={colors} styles={styles}>
            <View style={[styles.infoRow, { borderBottomWidth: 0, justifyContent: 'space-between', paddingRight: 5 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="moon" size={16} color={colors.textSecondary} style={{ marginRight: 10 }} />
                <Text style={styles.infoLabel}>Modo Oscuro</Text>
              </View>
              <Switch 
                value={theme === "dark"} 
                onValueChange={toggleTheme}
                trackColor={{ false: "#767577", true: colors.success }}
                thumbColor={theme === "dark" ? "#fff" : "#f4f3f4"}
              />
            </View>
          </Section>

          <Section title="Sincronización" iconName="sync" colors={colors} styles={styles}>
            <Row label="Estado" value={isConnected ? "En línea" : "Desconectado"} iconName="cloud" colors={colors} styles={styles} />
            <TouchableOpacity 
              style={[styles.syncBtn, { backgroundColor: colors.success + '20' }]} 
              onPress={handleSync}
              disabled={isSyncing}
            >
              {isSyncing ? <ActivityIndicator color={colors.success} size="small" /> : <Text style={[styles.syncBtnText, { color: colors.success }]}>Sincronizar Datos Locales</Text>}
            </TouchableOpacity>
          </Section>

          <Section title="Soporte y Ayuda" iconName="help-circle" colors={colors} styles={styles}>
            <Row label="Ayuda y Soporte" onPress={() => navigation.navigate("Help")} iconName="help-buoy" colors={colors} styles={styles} />
            <Row label="Términos y Condiciones" onPress={() => {}} iconName="document-text" colors={colors} styles={styles} />
            <Row label="Acerca de CobraGo" value="v1.1.0" isLast iconName="information-circle" colors={colors} styles={styles} />
          </Section>

          <View style={{ marginTop: 20, marginBottom: 40 }}>
            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
              <Icon name="log-out" size={20} color="#ff4444" style={{ marginRight: 8 }} />
              <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}
