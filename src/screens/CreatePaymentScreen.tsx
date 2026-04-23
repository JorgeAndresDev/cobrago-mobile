import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ActivityIndicator
} from "react-native";
import Toast from "react-native-toast-message";
import { paymentService } from "../services/paymentService";
import { loanService } from "../services/loanService";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { Colors } from "../theme/colors";
import { Prestamo } from "../types";
import { useCallback } from "react";

export default function CreatePaymentScreen() {
  const { colors } = useTheme();
  const route = useRoute<any>();
  const initialLoanId = route.params?.loanId;
  
  const [loanId, setLoanId] = useState<number | null>(initialLoanId || null);
  const [loans, setLoans] = useState<Prestamo[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<Prestamo[]>([]);
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [search, setSearch] = useState("");
  const [monto, setMonto] = useState("");
  const [comentario, setComentario] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  useFocusEffect(
    useCallback(() => {
      if (!initialLoanId) {
        fetchLoans();
      } else {
        setLoanId(initialLoanId);
      }
    }, [initialLoanId])
  );

  const fetchLoans = async () => {
    setLoadingLoans(true);
    try {
      const data = await loanService.getPrestamos();
      const pendientes = data.filter(l => l.estado !== "pagado");
      setLoans(pendientes);
      setFilteredLoans(pendientes);
    } catch (error) {
      console.error("Error fetching loans:", error);
    } finally {
      setLoadingLoans(false);
    }
  };

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

  const handleCreate = async () => {
    if (!monto || !loanId) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Monto y Préstamo son obligatorios'
      });
      return;
    }

    setLoading(true);
    try {
      await paymentService.createPayment({
        prestamo_id: loanId,
        monto: parseFloat(monto),
        comentario
      });
      Toast.show({
        type: 'success',
        text1: '¡Éxito!',
        text2: 'Cobro registrado correctamente'
      });
      setMonto("");
      setComentario("");
      if (initialLoanId) {
        navigation.goBack();
      } else {
        setLoanId(null);
        fetchLoans();
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo registrar el pago'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderLoanPickerItem = ({ item }: { item: Prestamo }) => (
    <TouchableOpacity 
      style={[
        styles.loanOption, 
        { backgroundColor: colors.bgDark, borderColor: colors.border },
        loanId === item.id && { borderColor: colors.success, backgroundColor: colors.primary + "10" }
      ]}
      onPress={() => setLoanId(item.id)}
    >
      <View style={[styles.loanOptionAvatar, { backgroundColor: colors.primary + "30" }]}>
        <Text style={[styles.loanOptionAvatarText, { color: colors.success }]}>{(item.nombre_cliente || "?").substring(0, 1).toUpperCase()}</Text>
      </View>
      <View style={{flex: 1}}>
        <Text style={[styles.loanOptionTitle, { color: colors.textPrimary }]}>{item.nombre_cliente || "Cliente Desconocido"}</Text>
        <Text style={[styles.loanOptionSub, { color: colors.textSecondary }]}>Deuda: ${(item.saldo ?? item.monto).toLocaleString()}  |  Cuotas: {item.num_cuotas}</Text>
      </View>
      {loanId === item.id && <Text style={[styles.checkIcon, { color: colors.success }]}>✔</Text>}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Registrar Cobro</Text>
          {loanId ? (
            <TouchableOpacity onPress={() => setLoanId(null)} style={[styles.chip, { backgroundColor: colors.primary + "30" }]}>
              <Text style={[styles.chipText, { color: colors.success }]}>PRÉSTAMO #{loanId} (Cambiar)</Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Selecciona un préstamo activo</Text>
          )}
        </View>

        <View style={styles.content}>
          {!loanId ? (
            <View style={styles.pickerContainer}>
              <TextInput
                style={[styles.searchInput, { backgroundColor: colors.bgDark, color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="Buscar cliente para cobrar..."
                placeholderTextColor={colors.textSecondary}
                value={search}
                onChangeText={setSearch}
              />
              {loadingLoans ? (
                <ActivityIndicator color={colors.success} style={{ marginTop: 40 }} />
              ) : (
                <FlatList
                  data={filteredLoans}
                  keyExtractor={item => item.id.toString()}
                  renderItem={renderLoanPickerItem}
                  ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.textSecondary }]}>No hay préstamos pendientes</Text>}
                  contentContainerStyle={{ paddingBottom: 100 }}
                />
              )}
            </View>
          ) : (
            <View style={[styles.formCard, { backgroundColor: colors.bgDark, borderColor: colors.border }]}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Cantidad a cobrar</Text>
                <TextInput 
                  style={[styles.amountInput, { color: colors.textPrimary, borderBottomColor: colors.border }]} 
                  value={monto} 
                  onChangeText={setMonto} 
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  autoFocus
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Nota o comentario</Text>
                <TextInput 
                  style={[styles.textArea, { backgroundColor: colors.bgLight, color: colors.textPrimary }]} 
                  value={comentario} 
                  onChangeText={setComentario} 
                  multiline
                  numberOfLines={3}
                  placeholder="Opcional..."
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <TouchableOpacity 
                style={[styles.button, { backgroundColor: colors.primary, shadowColor: colors.success }, loading && styles.disabled]} 
                onPress={handleCreate}
                disabled={loading}
              >
                <Text style={[styles.buttonText, { color: colors.textLight }]}>{loading ? "Procesando..." : "Confirmar Cobro"}</Text>
              </TouchableOpacity>
              
              {!initialLoanId && (
                <TouchableOpacity style={styles.cancelLink} onPress={() => setLoanId(null)}>
                  <Text style={[styles.cancelLinkText, { color: colors.textSecondary }]}>Cambiar préstamo</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: { padding: 30, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: "bold" },
  subtitle: { fontSize: 14, marginTop: 5 },
  chip: { 
    alignSelf: "flex-start", 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 8,
    marginTop: 10 
  },
  chipText: { fontSize: 11, fontWeight: "bold" },
  content: { flex: 1, padding: 20 },
  pickerContainer: { flex: 1 },
  searchInput: {
    borderRadius: 16,
    padding: 15,
    fontSize: 15,
    borderWidth: 1,
    marginBottom: 20,
  },
  loanOption: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  loanOptionActive: {
  },
  loanOptionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  loanOptionAvatarText: { fontSize: 16, fontWeight: "bold" },
  loanOptionTitle: { fontWeight: "bold", fontSize: 16 },
  loanOptionSub: { fontSize: 12, marginTop: 4 },
  checkIcon: { fontSize: 18, fontWeight: "bold", marginLeft: 10 },
  formCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
  },
  inputGroup: { marginBottom: 25 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 10 },
  amountInput: { 
    fontSize: 40, 
    fontWeight: "bold", 
    borderBottomWidth: 1,
    paddingBottom: 10
  },
  textArea: { 
    padding: 15, 
    borderRadius: 14, 
    fontSize: 15, 
    minHeight: 100,
    textAlignVertical: "top" 
  },
  button: { 
    padding: 18, 
    borderRadius: 16, 
    alignItems: "center", 
    marginTop: 10,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5
  },
  disabled: { opacity: 0.6 },
  buttonText: { fontSize: 17, fontWeight: "bold" },
  cancelLink: { marginTop: 20, alignItems: "center" },
  cancelLinkText: { fontSize: 14 },
  emptyText: { textAlign: "center", marginTop: 40 }
});
