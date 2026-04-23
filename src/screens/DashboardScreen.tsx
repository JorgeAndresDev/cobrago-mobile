import React, { useContext, useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  Dimensions,
  RefreshControl 
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { StatusBar } from "expo-status-bar";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { Colors } from "../theme/colors";
import { loanService } from "../services/loanService";
import { Prestamo } from "../types";
import { useCallback } from "react";
import api from "../api/axios";

const { width } = Dimensions.get("window");

export default function DashboardScreen() {
  const { user } = useContext(AuthContext);
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [loans, setLoans] = useState<Prestamo[]>([]);
  const [stats, setStats] = useState({ cartera_activa: 0, recaudado_hoy: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [loansData, statsRes] = await Promise.all([
        loanService.getPrestamos(),
        api.get("/stats/dashboard")
      ]);
      setLoans(loansData.slice(0, 5)); // Solo los últimos 5 para el dashboard
      setStats(statsRes.data);
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
      <StatusBar style="light" />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.success} />}
      >
        
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>¡Hola</Text>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.username || "Cobrador"}!</Text>
          </View>
          <TouchableOpacity 
            onPress={() => navigation.navigate("Perfil")} 
            style={[styles.avatarMini, { backgroundColor: colors.bgDark, borderColor: colors.border }]}
          >
            <Text style={[styles.avatarMiniText, { color: colors.success }]}>{user?.username?.substring(0,1).toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        {/* Main Balance Card (Emerald Premium Style) */}
        <View style={[styles.balanceCard, { backgroundColor: colors.primary, shadowColor: colors.success }]}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Recaudado Hoy</Text>
            <Text style={styles.eyeIcon}>📈</Text>
          </View>
          <Text style={styles.balanceValue}>${(stats.recaudado_hoy || 0).toLocaleString()}</Text>
          <View style={styles.balanceFooter}>
            <View style={styles.trendBadge}>
              <Text style={styles.trendText}>Cartera Activa: ${(stats.cartera_activa || 0).toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Action Grid */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionItem} 
            onPress={() => navigation.navigate("Clientes")}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.bgDark, borderColor: colors.border }]}>
              <Text style={styles.iconEmoji}>👥</Text>
            </View>
            <Text style={[styles.iconLabel, { color: colors.textPrimary }]}>Clientes</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionItem} 
            onPress={() => navigation.navigate("Pagar")}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.success + "20", borderColor: colors.border }]}>
              <Text style={styles.iconEmoji}>💰</Text>
            </View>
            <Text style={[styles.iconLabel, { color: colors.textPrimary }]}>Cobrar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionItem} 
            onPress={() => navigation.navigate("Loans")}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.bgDark, borderColor: colors.border }]}>
              <Text style={styles.iconEmoji}>📄</Text>
            </View>
            <Text style={[styles.iconLabel, { color: colors.textPrimary }]}>Préstamos</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Actividad Reciente</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Loans")}>
            <Text style={[styles.viewMore, { color: colors.success }]}>Ver todo</Text>
          </TouchableOpacity>
        </View>

        {loans.map((loan) => (
          <TouchableOpacity 
            key={loan.id} 
            style={[styles.activityCard, { backgroundColor: colors.bgDark, borderColor: colors.border }]}
            onPress={() => navigation.navigate("Loans")}
          >
            <View style={[styles.activityIcon, { backgroundColor: colors.primary + "20" }]}>
              <Text style={{color: colors.success, fontWeight: "bold", fontSize: 18}}>
                {(loan.nombre_cliente || "?").substring(0, 1).toUpperCase()}
              </Text>
            </View>
            <View style={styles.activityInfo}>
              <Text style={[styles.activityTitle, { color: colors.textPrimary }]}>{loan.nombre_cliente || "Desconocido"}</Text>
            </View>
            <View style={styles.activityAmount}>
              <Text style={[styles.amountText, { color: colors.textPrimary }]}>${(loan.saldo ?? loan.monto).toLocaleString()}</Text>
              <Text style={[
                styles.statusTextMini, 
                { color: loan.estado === "pagado" ? colors.success : colors.accent }
              ]}>
                {loan.estado}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {loans.length === 0 && (
          <View style={styles.emptyActivity}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No hay actividad hoy</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  welcomeText: {
    fontSize: 14,
    color: "#94a3b8",
  },
  userName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: -0.5,
  },
  avatarMini: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.bgDark,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  avatarMiniText: {
    color: Colors.success,
    fontWeight: "bold",
  },
  balanceCard: {
    backgroundColor: Colors.primary,
    padding: 24,
    borderRadius: 28,
    marginBottom: 30,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontWeight: "500",
  },
  eyeIcon: {
    color: "#fff",
    fontSize: 16,
  },
  balanceValue: {
    color: "#fff",
    fontSize: 38,
    fontWeight: "bold",
    letterSpacing: -1,
  },
  balanceFooter: {
    marginTop: 20,
  },
  trendBadge: {
    backgroundColor: "rgba(74, 222, 128, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  trendText: {
    color: "#4ade80",
    fontSize: 12,
    fontWeight: "bold",
  },
  actionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  actionItem: {
    alignItems: "center",
    width: (width - 48) / 3.5,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: Colors.bgDark,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  iconEmoji: {
    fontSize: 24,
  },
  iconLabel: {
    color: "#e2e8f0",
    fontSize: 13,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  viewMore: {
    color: Colors.success,
    fontSize: 14,
    fontWeight: "600",
  },
  activityCard: {
    backgroundColor: Colors.bgDark,
    padding: 16,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  activitySubtitle: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
  },
  activityAmount: {
    alignItems: "flex-end",
  },
  amountText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  statusTextMini: {
    color: Colors.success,
    fontSize: 10,
    textTransform: "uppercase",
    fontWeight: "bold",
    marginTop: 2,
  },
  emptyActivity: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    color: "#64748b",
  }
});
