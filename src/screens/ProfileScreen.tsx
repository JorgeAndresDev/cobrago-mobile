import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Switch } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";

export default function ProfileScreen() {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme, colors } = useTheme();
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
      <View style={styles.header}>
        <View style={[styles.avatarLarge, { backgroundColor: colors.primary + "30", borderColor: colors.success }]}>
          <Text style={[styles.avatarText, { color: colors.success }]}>{user?.username?.substring(0, 1).toUpperCase()}</Text>
        </View>
        <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.username}</Text>
        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email || "cobrador@cobrago.com"}</Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.menuItem, { backgroundColor: colors.bgDark, borderColor: colors.border }]}>
          <Text style={[styles.menuText, { color: colors.textPrimary }]}>Modo Oscuro</Text>
          <Switch 
            value={theme === "dark"} 
            onValueChange={toggleTheme}
            trackColor={{ false: "#cbd5e1", true: colors.success }}
            thumbColor={"#fff"}
          />
        </View>
        
        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.bgDark, borderColor: colors.border }]}>
          <Text style={[styles.menuText, { color: colors.textPrimary }]}>Configuración de Cuenta</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: colors.bgDark, borderColor: colors.border }]}
          onPress={() => navigation.navigate("Help")}
        >
          <Text style={[styles.menuText, { color: colors.textPrimary }]}>Centro de Ayuda</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: "center", paddingVertical: 40 },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 2,
  },
  avatarText: { fontSize: 40, fontWeight: "bold" },
  userName: { fontSize: 24, fontWeight: "bold" },
  userEmail: { fontSize: 14, marginTop: 4 },
  content: { padding: 24 },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  menuText: { fontSize: 16, fontWeight: "500" },
  menuArrow: { color: "#64748b", fontSize: 20 },
  logoutButton: {
    marginTop: 40,
    backgroundColor: "rgba(255, 77, 77, 0.1)",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  logoutText: { color: "#ff4d4d", fontSize: 16, fontWeight: "bold" },
});
