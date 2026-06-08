import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import BackgroundWrapper from "../components/BackgroundWrapper";
import { dbService } from "../services/dbService";
import { Prestamo } from "../types";
import { useNavigation } from "@react-navigation/native";

type AgendaTab = 'HOY' | 'MAÑANA' | 'SEMANA' | 'VENCIDOS';

export default function AgendaScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<AgendaTab>('HOY');
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    const db = await dbService.getDb();
    
    // In a real app, logic would filter by date. 
    // Here we simulate for the demo.
    const query = activeTab === 'VENCIDOS' 
      ? "SELECT * FROM prestamos WHERE estado = 'pendiente' LIMIT 5"
      : "SELECT * FROM prestamos ORDER BY id DESC LIMIT 10";
      
    const results = await db.getAllAsync<any>(query);
    
    // Simulate address and pending amount
    const processed = results.map(r => ({
      ...r,
      direccion: "Calle Principal #123",
      monto_pendiente: r.saldo || r.monto
    }));
    
    setItems(processed);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const Tab = ({ label, type }: { label: string, type: AgendaTab }) => (
    <TouchableOpacity 
      onPress={() => setActiveTab(type)}
      style={[
        styles.tab, 
        activeTab === type && { borderBottomColor: colors.success, borderBottomWidth: 2 }
      ]}
    >
      <Text style={[
        styles.tabText, 
        { color: activeTab === type ? colors.success : colors.textSecondary }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Calendario de Cobros</Text>
        </View>

        <View style={styles.tabContainer}>
          <Tab label="Hoy" type="HOY" />
          <Tab label="Mañana" type="MAÑANA" />
          <Tab label="Semana" type="SEMANA" />
          <Tab label="Vencidos" type="VENCIDOS" />
        </View>

        {loading ? (
          <ActivityIndicator color={colors.success} style={{ marginTop: 40 }} />
        ) : (
          <ScrollView contentContainerStyle={styles.scroll}>
            {items.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.card, { backgroundColor: colors.bgDark, borderColor: colors.border }]}
                onPress={() => navigation.navigate("CreatePayment", { loanId: item.id })}
              >
                <View style={styles.cardHeader}>
                  <Text style={[styles.clientName, { color: colors.textPrimary }]}>{item.nombre_cliente}</Text>
                  <View style={[styles.badge, { backgroundColor: colors.accent + '20' }]}>
                    <Text style={[styles.badgeText, { color: colors.accent }]}>Pendiente</Text>
                  </View>
                </View>
                <Text style={[styles.address, { color: colors.textSecondary }]}>📍 {item.direccion}</Text>
                <View style={styles.cardFooter}>
                  <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Por cobrar:</Text>
                  <Text style={[styles.amount, { color: colors.success }]}>${item.monto_pendiente.toLocaleString()}</Text>
                </View>
              </TouchableOpacity>
            ))}

            {items.length === 0 && (
              <View style={styles.empty}>
                <Text style={{ color: colors.textSecondary }}>No hay cobros para este periodo</Text>
              </View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold' },
  tabContainer: { 
    flexDirection: 'row', 
    paddingHorizontal: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255,255,255,0.1)' 
  },
  tab: { paddingVertical: 15, paddingHorizontal: 15 },
  tabText: { fontWeight: '600', fontSize: 13 },
  scroll: { padding: 20 },
  card: { 
    padding: 16, 
    borderRadius: 16, 
    borderWidth: 1, 
    marginBottom: 12 
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  clientName: { fontSize: 16, fontWeight: 'bold' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  address: { fontSize: 13, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', alignItems: 'center' },
  amountLabel: { fontSize: 13, marginRight: 5 },
  amount: { fontSize: 18, fontWeight: 'bold' },
  empty: { alignItems: 'center', marginTop: 100 }
});
