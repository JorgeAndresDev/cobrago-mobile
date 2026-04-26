import React, { useContext, useState, useCallback } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  RefreshControl,
  ActivityIndicator,
  Image
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { StatusBar } from "expo-status-bar";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import BackgroundWrapper from "../components/BackgroundWrapper";
import { loanService } from "../services/loanService";
import { Prestamo } from "../types";
import api from "../api/axios";
import { createDashboardStyles } from "../styles/dashboard.styles";

export default function DashboardScreen() {
  const { user } = useContext(AuthContext);
  const { colors } = useTheme();
  const styles = createDashboardStyles(colors);
  const navigation = useNavigation<any>();
  
  const [loans, setLoans] = useState<Prestamo[]>([]);
  const [stats, setStats] = useState({ cartera_activa: 0, recaudado_hoy: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [loansData, statsRes] = await Promise.all([
        loanService.getPrestamos(),
        api.get("/stats/dashboard")
      ]);
      setLoans(loansData.slice(0, 5));
      setStats(statsRes.data);
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
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
    <BackgroundWrapper>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.success} />}
        >
          
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image 
                source={require("../../assets/logo-cobrago.png")} 
                style={{ width: 54, height: 54, marginRight: 12, resizeMode: 'contain' }}
              />
              <View>
                <Text style={styles.welcomeText}>¡Hola</Text>
                <Text style={styles.userName}>{user?.username || "Cobrador"}!</Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => navigation.navigate("Perfil")} 
              style={styles.avatarMini}
            >
              <Text style={styles.avatarMiniText}>{user?.username?.substring(0,1).toUpperCase()}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.balanceCard}>
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

          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionItem} 
              onPress={() => navigation.navigate("Clientes")}
            >
              <View style={styles.iconBox}>
                <Text style={styles.iconEmoji}>👥</Text>
              </View>
              <Text style={styles.iconLabel}>Clientes</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem} 
              onPress={() => navigation.navigate("Pagar")}
            >
              <View style={[styles.iconBox, { backgroundColor: colors.success + "20" }]}>
                <Text style={styles.iconEmoji}>💰</Text>
              </View>
              <Text style={styles.iconLabel}>Cobrar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem} 
              onPress={() => navigation.navigate("Loans")}
            >
              <View style={styles.iconBox}>
                <Text style={styles.iconEmoji}>📄</Text>
              </View>
              <Text style={styles.iconLabel}>Préstamos</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Actividad Reciente</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Loans")}>
              <Text style={styles.viewMore}>Ver todo</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={colors.success} style={{ marginTop: 20 }} />
          ) : loans.map((loan) => (
            <TouchableOpacity 
              key={loan.id} 
              style={styles.activityCard}
              onPress={() => navigation.navigate("CreatePayment", { loanId: loan.id })}
            >
              <View style={styles.activityIcon}>
                <Text style={styles.activityIconText}>
                  {(loan.nombre_cliente || "?").substring(0, 1).toUpperCase()}
                </Text>
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>{loan.nombre_cliente || "Desconocido"}</Text>
              </View>
              <View style={styles.activityAmount}>
                <Text style={styles.amountText}>${(loan.saldo ?? loan.monto).toLocaleString()}</Text>
                <Text style={[
                  styles.statusTextMini, 
                  { color: loan.estado === "pagado" ? colors.success : colors.accent }
                ]}>
                  {loan.estado}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          {!loading && loans.length === 0 && (
            <View style={styles.emptyActivity}>
              <Text style={styles.emptyText}>No hay actividad hoy</Text>
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}
