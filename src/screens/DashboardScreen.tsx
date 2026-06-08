import React, { useContext, useState, useCallback } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator,
  Image
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../context/AuthContext";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import BackgroundWrapper from "../components/BackgroundWrapper";
import { loanService } from "../services/loanService";
import { Prestamo, DashboardStats } from "../types";
import api from "../api/axios";
import { createDashboardStyles } from "../styles/dashboard.styles";
import { Icon } from "../components/Icon";

export default function DashboardScreen() {
  const { user } = useContext(AuthContext);
  const { colors } = useTheme();
  const styles = createDashboardStyles(colors);
  const navigation = useNavigation<any>();
  
  const [loans, setLoans] = useState<Prestamo[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    recaudado_hoy: 0,
    cartera_activa: 0,
    total_clientes: 0,
    prestamos_activos: 0,
    clientes_mora: 0,
    cobros_hoy: 0
  });
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
    } catch (error: any) {
      console.error("Dashboard error:", error);
      Toast.show({
        type: 'error',
        text1: 'Error de datos',
        text2: 'No se pudieron sincronizar los datos.'
      });
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

  const MetricCard = ({ title, value, iconName, color }: { title: string, value: string | number, iconName: string, color: string }) => (
    <View style={[styles.metricCard, { borderColor: color + '30' }]}>
      <View style={[styles.metricIcon, { backgroundColor: color + '20' }]}>
        <Icon name={iconName} size={20} color={color} />
      </View>
      <View>
        <Text style={styles.metricLabel}>{title}</Text>
        <Text style={styles.metricValue}>{value}</Text>
      </View>
    </View>
  );

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
              <Text style={styles.avatarMiniText}>
                {user?.username?.substring(0,2).toUpperCase() || "CO"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>Recaudado Hoy</Text>
              <Icon name="banknote" size={24} color={colors.success} />
            </View>
            <Text style={styles.balanceValue}>${(stats.recaudado_hoy || 0).toLocaleString()}</Text>
            <View style={styles.balanceFooter}>
              <View style={styles.trendBadge}>
                <Text style={styles.trendText}>
                  Cobros hoy: {stats.cobros_hoy || 0}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <MetricCard 
              title="Cartera Activa" 
              value={`$${(stats.cartera_activa || 0).toLocaleString()}`} 
              iconName="trending-up" 
              color={colors.primary} 
            />
            <MetricCard 
              title="Clientes" 
              value={stats.total_clientes || 0} 
              iconName="users" 
              color={colors.success} 
            />
            <MetricCard 
              title="En Mora" 
              value={stats.clientes_mora || 0} 
              iconName="alert-circle" 
              color={colors.accent} 
            />
            <MetricCard 
              title="P. Activos" 
              value={stats.prestamos_activos || 0} 
              iconName="file-text" 
              color={colors.primary} 
            />
          </View>

          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionItem} 
              onPress={() => navigation.navigate("Clientes")}
            >
              <View style={styles.iconBox}>
                <Icon name="user-plus" size={24} color={colors.primary} />
              </View>
              <Text style={styles.iconLabel}>Clientes</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem} 
              onPress={() => navigation.navigate("Pagar")}
            >
              <View style={[styles.iconBox, { backgroundColor: colors.success + "20" }]}>
                <Icon name="banknote" size={24} color={colors.success} />
              </View>
              <Text style={styles.iconLabel}>Cobrar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem} 
              onPress={() => navigation.navigate("Agenda")}
            >
              <View style={[styles.iconBox, { backgroundColor: colors.accent + "20" }]}>
                <Icon name="calendar-days" size={24} color={colors.accent} />
              </View>
              <Text style={styles.iconLabel}>Agenda</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Actividad Reciente</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Loans")} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.viewMore}>Ver todo</Text>
              <Icon name="arrow-right" size={14} color={colors.success} style={{ marginLeft: 4 }} />
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
                <Text style={styles.activitySubtitle}>{loan.frecuencia_pago}</Text>
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
              <View style={styles.emptyIconBox}>
                <Icon name="inbox" size={40} color={colors.textSecondary} />
              </View>
              <Text style={styles.emptyText}>No hay actividad hoy</Text>
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}
