import React, { useState, useEffect, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Dimensions
} from "react-native";
import { loanService } from "../services/loanService";
import { Prestamo } from "../types";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import BackgroundWrapper from "../components/BackgroundWrapper";
import { Icon } from "../components/Icon";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrestamosScreen() {
  const { colors } = useTheme();
  const [loans, setPrestamos] = useState<Prestamo[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<Prestamo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const navigation = useNavigation<any>();

  const fetchPrestamos = async () => {
    try {
      const data = await loanService.getPrestamos();
      setPrestamos(data);
      setFilteredLoans(data);
    } catch (error) {
      console.error("Error fetching loans:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPrestamos();
    }, [])
  );

  useEffect(() => {
    if (search === "") {
      setFilteredLoans(loans);
    } else {
      const lowerSearch = search.toLowerCase();
      const filtered = loans.filter(l => 
        (l.nombre_cliente && l.nombre_cliente.toLowerCase().includes(lowerSearch))
      );
      setFilteredLoans(filtered);
    }
  }, [search, loans]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPrestamos();
  };

  const renderPrestamoItem = ({ item }: { item: Prestamo }) => {
    const estado = item.estado || "pendiente";
    const isPagado = estado === "pagado";
    const statusColor = isPagado ? colors.success : colors.warning;

    return (
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: colors.bgDark, borderColor: colors.border }]}
        onPress={() => navigation.navigate("CreatePayment", { loanId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.loanId, { color: colors.textPrimary }]}>{item.nombre_cliente || "Cliente Desconocido"}</Text>
            <View style={styles.dateContainer}>
                <Icon name="calendar-days" size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
                <Text style={styles.dateText}>Iniciado: {new Date(item.fecha_creacion).toLocaleDateString()}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + "15" }]}>
            {isPagado ? <Icon name="check-circle" size={10} color={statusColor} /> : <Icon name="clock" size={10} color={statusColor} />}
            <Text style={[styles.statusText, { color: statusColor, marginLeft: 4 }]}>
              {estado.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.mainInfo}>
            <Text style={styles.montoLabel}>Monto Prestado</Text>
            <View style={styles.montoRow}>
                <Icon name="banknote" size={24} color={colors.success} style={{ marginRight: 8 }} />
                <Text style={[styles.montoValue, { color: colors.textPrimary }]}>${item.monto?.toLocaleString()}</Text>
            </View>
          </View>
          
          <View style={[styles.detailsGrid, { backgroundColor: colors.bgLight + "40" }]}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Pagos</Text>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{item.num_cuotas} {item.frecuencia_pago}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Saldo Pendiente</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="wallet" size={12} color={colors.success} style={{ marginRight: 4 }} />
                <Text style={[styles.detailValue, { color: colors.success }]}>
                    ${(item.saldo || 0).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.cardFooter, { borderTopColor: colors.border + "30" }]}>
          <Text style={[styles.footerAction, { color: colors.success }]}>Registrar Pago</Text>
          <Icon name="chevron-right" size={16} color={colors.success} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Préstamos</Text>
          <Icon name="file-text" size={24} color={colors.success} style={{ marginLeft: 10, marginTop: 6 }} />
        </View>

        <View style={styles.searchContainer}>
          <View style={[styles.searchWrapper, { backgroundColor: colors.bgDark, borderColor: colors.border }]}>
            <Icon name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Buscar por cliente..."
              placeholderTextColor={colors.textSecondary}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.success} />
          </View>
        ) : (
          <FlatList
            data={filteredLoans}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderPrestamoItem}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.success} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={[styles.emptyIconBox, { backgroundColor: colors.bgDark }]}>
                    <Icon name="inbox" size={48} color={colors.textSecondary} />
                </View>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No hay préstamos registrados</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingHorizontal: 24, 
    paddingTop: 60,
    paddingBottom: 20
  },
  title: { fontSize: 28, fontWeight: "bold" },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 15,
    borderWidth: 1,
    height: 54,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  list: { paddingHorizontal: 24, paddingBottom: 100 },
  card: { 
    borderRadius: 24, 
    marginBottom: 20, 
    borderWidth: 1,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    paddingBottom: 10
  },
  loanId: { fontSize: 18, fontWeight: "bold" },
  dateContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  dateText: { fontSize: 12, color: "#94a3b8" },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusText: { fontSize: 10, fontWeight: "bold" },
  cardBody: { paddingHorizontal: 20, marginBottom: 15 },
  mainInfo: { marginBottom: 16 },
  montoLabel: { fontSize: 12, color: "#94a3b8", marginBottom: 6 },
  montoRow: { flexDirection: 'row', alignItems: 'center' },
  montoValue: { fontSize: 26, fontWeight: "bold" },
  detailsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderRadius: 18,
  },
  detailItem: { flex: 1 },
  detailLabel: { fontSize: 10, color: "#64748b", marginBottom: 4, textTransform: "uppercase" },
  detailValue: { fontSize: 13, fontWeight: "bold" },
  cardFooter: {
    borderTopWidth: 1,
    padding: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  footerAction: { fontSize: 13, fontWeight: "bold", marginRight: 5 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { padding: 60, alignItems: "center", marginTop: 40 },
  emptyIconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  emptyText: { textAlign: "center", fontSize: 14, fontWeight: '500' },
});
