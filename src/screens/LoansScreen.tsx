import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  TextInput
} from "react-native";
import { loanService } from "../services/loanService";
import { Prestamo } from "../types";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { Colors } from "../theme/colors";
import { useCallback } from "react";

const { width } = Dimensions.get("window");

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
    const statusColor = estado === "pagado" ? colors.success : colors.accent;

    return (
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: colors.bgDark, borderColor: colors.border }]}
        onPress={() => navigation.navigate("CreatePayment", { loanId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.loanId, { color: colors.textPrimary }]}>{item.nombre_cliente || "Cliente Desconocido"}</Text>
            <Text style={styles.dateText}>Iniciado: {new Date(item.fecha_creacion).toLocaleDateString()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {estado.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.mainInfo}>
            <Text style={styles.montoLabel}>Monto Original</Text>
            <Text style={[styles.montoValue, { color: colors.textPrimary }]}>${item.monto?.toLocaleString()}</Text>
          </View>
          
          <View style={[styles.detailsGrid, { backgroundColor: colors.bgLight }]}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Cuotas</Text>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{item.num_cuotas}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Frecuencia</Text>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{item.frecuencia_pago}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Saldo</Text>
              <Text style={[styles.detailValue, { color: colors.success }]}>
                ${(item.saldo || 0).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
          <Text style={[styles.footerAction, { color: colors.success }]}>Registrar Pago ›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.center, { backgroundColor: colors.secondary }]}>
        <ActivityIndicator size="large" color={colors.success} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Lista de Préstamos</Text>
        <View style={[styles.headerDot, { backgroundColor: colors.success }]} />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.bgDark, color: colors.textPrimary, borderColor: colors.border }]}
          placeholder="Buscar por cliente..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      
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
            <Text style={styles.emptyEmoji}>📂</Text>
            <Text style={styles.emptyText}>No hay préstamos registrados</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: Colors.bgDark,
    borderRadius: 16,
    padding: 15,
    color: "#fff",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
  },
  headerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
    marginLeft: 8,
    marginTop: 8,
  },
  list: {
    padding: 20,
    paddingTop: 0,
  },
  card: {
    backgroundColor: Colors.bgDark,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  loanId: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  clientName: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: "600",
    marginTop: 2,
  },
  dateText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  cardBody: {
    marginBottom: 20,
  },
  mainInfo: {
    marginBottom: 16,
  },
  montoLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 4,
  },
  montoValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  detailsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#1e293b50",
    padding: 15,
    borderRadius: 16,
  },
  detailItem: {
    alignItems: "flex-start",
  },
  detailLabel: {
    fontSize: 10,
    color: "#64748b",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#e2e8f0",
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    paddingTop: 15,
    alignItems: "flex-end",
  },
  footerAction: {
    color: Colors.success,
    fontSize: 13,
    fontWeight: "bold",
  },
  emptyContainer: {
    padding: 60,
    alignItems: "center",
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 15,
  },
  emptyText: {
    color: "#64748b",
    fontSize: 16,
    textAlign: "center",
  },
});
