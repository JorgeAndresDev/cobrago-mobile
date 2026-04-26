import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import Toast from "react-native-toast-message";
import { loanService } from "../services/loanService";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import BackgroundWrapper from "../components/BackgroundWrapper";
import { Colors } from "../theme/colors";

export default function CreateLoanScreen() {
  const { colors } = useTheme();
  const route = useRoute<any>();
  const { clientId, clientName } = route.params;
  
  const [monto, setMonto] = useState("");
  const [cuotas, setCuotas] = useState("24");
  const [frecuencia, setFrecuencia] = useState("diaria");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleCreate = async () => {
    if (!monto || !cuotas) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Monto y cuotas son obligatorios'
      });
      return;
    }

    setLoading(true);
    try {
      await loanService.createLoanForClient(clientId, {
        monto: parseFloat(monto),
        num_cuotas: parseInt(cuotas),
        frecuencia_pago: frecuencia, // CORREGIDO: coincide con el backend
      });
      Toast.show({
        type: 'success',
        text1: '¡Éxito!',
        text2: 'Préstamo creado correctamente'
      });
      navigation.goBack();
    } catch (error: any) {
      console.error(error.response?.data || error.message);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo crear el préstamo. Verifica los datos.'
      });
    } finally {
      setLoading(false);
    }
  };

  const FrecuenciaSelector = ({ label, value }: { label: string, value: string }) => (
    <TouchableOpacity 
      style={[
        styles.frecuenciaOption, 
        { borderColor: colors.border },
        frecuencia === value && { borderColor: colors.success, backgroundColor: colors.primary + "20" }
      ]}
      onPress={() => setFrecuencia(value)}
    >
      <Text style={[
        styles.frecuenciaText, 
        { color: colors.textSecondary },
        frecuencia === value && { color: colors.success }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity 
            style={{ marginBottom: 20, paddingVertical: 10 }} 
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: colors.success, fontSize: 16, fontWeight: "600" }}>‹ Volver</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Nuevo Préstamo</Text>
            <View style={[styles.chip, { backgroundColor: colors.primary + "30" }]}>
              <Text style={[styles.chipText, { color: colors.success }]}>CLIENTE: {clientName?.toUpperCase()}</Text>
            </View>
          </View>
          
          <View style={[styles.formCard, { backgroundColor: colors.bgDark, borderColor: colors.border }]}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Monto a Prestar ($)</Text>
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
              <Text style={[styles.label, { color: colors.textSecondary }]}>Número de Cuotas</Text>
              <TextInput 
                style={[styles.input, { borderColor: colors.border, backgroundColor: colors.bgLight, color: colors.textPrimary }]} 
                value={cuotas} 
                onChangeText={setCuotas} 
                keyboardType="numeric"
                placeholder="Ej: 24"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Frecuencia de Pago</Text>
              <View style={styles.frecuenciaRow}>
                <FrecuenciaSelector label="Diaria" value="diaria" />
                <FrecuenciaSelector label="Semanal" value="semanal" />
                <FrecuenciaSelector label="Mensual" value="mensual" />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.primary, shadowColor: colors.success }, loading && styles.disabled]} 
              onPress={handleCreate}
              disabled={loading}
            >
              <Text style={[styles.buttonText, { color: colors.textLight }]}>{loading ? "Procesando..." : "Crear Préstamo"}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  </BackgroundWrapper>
);
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 40 },
  header: { marginBottom: 30 },
  title: { fontSize: 28, fontWeight: "bold" },
  chip: { 
    alignSelf: "flex-start", 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 8,
    marginTop: 10 
  },
  chipText: { fontSize: 11, fontWeight: "bold" },
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
  input: { 
    borderWidth: 1, 
    padding: 15, 
    borderRadius: 14, 
    fontSize: 16,
  },
  frecuenciaRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  frecuenciaOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  frecuenciaOptionActive: {
  },
  frecuenciaText: {
    fontSize: 13,
    fontWeight: "bold"
  },
  frecuenciaTextActive: {
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
});
