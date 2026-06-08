import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { loanService } from "../services/loanService";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import BackgroundWrapper from "../components/BackgroundWrapper";
import { Icon } from "../components/Icon";

export default function CreateLoanScreen() {
  const { colors } = useTheme();
  const route = useRoute<any>();
  const { clientId, clientName } = route.params;
  
  const [monto, setMonto] = useState("");
  const [cuotas, setCuotas] = useState("24");
  const [frecuencia, setFrecuencia] = useState("diaria");
  const [tipoInteres, setTipoInteres] = useState("diario");
  const [porcentaje, setPorcentaje] = useState("20");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  const montoNum = parseFloat(monto) || 0;
  const porcentajeNum = parseFloat(porcentaje) || 0;
  const montoInteres = (montoNum * porcentajeNum) / 100;
  const montoTotal = montoNum + montoInteres;
  const valorCuota = montoTotal / (parseInt(cuotas) || 1);

  const handleCreate = async () => {
    if (!monto || !cuotas) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Monto y cuotas son obligatorios' });
      return;
    }
    setLoading(true);
    try {
      await loanService.createLoanForClient(clientId, {
        uuid: `${Date.now()}-${clientId}`,
        monto: montoNum,
        monto_total: montoTotal,
        tipo_interes: tipoInteres,
        porcentaje_interes: porcentajeNum,
        num_cuotas: parseInt(cuotas),
        frecuencia_pago: frecuencia,
      });
      Toast.show({ type: 'success', text1: '¡Éxito!', text2: 'Préstamo creado correctamente' });
      navigation.goBack();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo crear el préstamo.' });
    } finally {
      setLoading(false);
    }
  };

  const OptionSelector = ({ label, value, current, setter }: any) => (
    <TouchableOpacity 
      style={[
        styles.frecuenciaOption, 
        current === value ? { borderColor: colors.success, backgroundColor: colors.success + "15" } : { borderColor: colors.border }
      ]}
      onPress={() => setter(value)}
    >
      <Text style={[styles.frecuenciaText, current === value ? { color: colors.success } : { color: colors.textSecondary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
          <ScrollView contentContainerStyle={styles.content}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={24} color={colors.success} />
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.textPrimary }]}>Nuevo Préstamo</Text>
              <View style={[styles.chip, { backgroundColor: colors.primary + "20" }]}>
                <Text style={[styles.chipText, { color: colors.success }]}>CLIENTE: {clientName?.toUpperCase()}</Text>
              </View>
            </View>
            
            <View style={[styles.formCard, { backgroundColor: colors.bgDark, borderColor: colors.border }]}>
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                    <Icon name="banknote" size={14} color={colors.textSecondary} />
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Monto Principal</Text>
                </View>
                <TextInput 
                  style={[styles.amountInput, { color: colors.textPrimary, borderBottomColor: colors.border }]} 
                  value={monto} 
                  onChangeText={setMonto} 
                  keyboardType="numeric" 
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary + "50"}
                  autoFocus
                />
              </View>

              <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                      <View style={styles.labelRow}>
                        <Icon name="percent" size={14} color={colors.textSecondary} />
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Interés</Text>
                      </View>
                      <TextInput 
                          style={[styles.input, { borderColor: colors.border, backgroundColor: colors.bgLight + '20', color: colors.textPrimary }]} 
                          value={porcentaje} 
                          onChangeText={setPorcentaje} 
                          keyboardType="numeric"
                      />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                      <View style={styles.labelRow}>
                        <Icon name="hash" size={14} color={colors.textSecondary} />
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Cuotas</Text>
                      </View>
                      <TextInput 
                          style={[styles.input, { borderColor: colors.border, backgroundColor: colors.bgLight + '20', color: colors.textPrimary }]} 
                          value={cuotas} 
                          onChangeText={setCuotas} 
                          keyboardType="numeric"
                      />
                  </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary, marginBottom: 12 }]}>Tipo de Interés</Text>
                <View style={styles.frecuenciaRow}>
                  <OptionSelector label="Diario" value="diario" current={tipoInteres} setter={setTipoInteres} />
                  <OptionSelector label="Sem." value="semanal" current={tipoInteres} setter={setTipoInteres} />
                  <OptionSelector label="Quinc." value="quincenal" current={tipoInteres} setter={setTipoInteres} />
                  <OptionSelector label="Mens." value="mensual" current={tipoInteres} setter={setTipoInteres} />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                    <Icon name="calendar-days" size={14} color={colors.textSecondary} />
                    <Text style={[styles.label, { color: colors.textSecondary, marginBottom: 0 }]}>Frecuencia de Pago</Text>
                </View>
                <View style={[styles.frecuenciaRow, { marginTop: 12 }]}>
                  <OptionSelector label="Diario" value="diaria" current={frecuencia} setter={setFrecuencia} />
                  <OptionSelector label="Semanal" value="semanal" current={frecuencia} setter={setFrecuencia} />
                  <OptionSelector label="Quincenal" value="quincenal" current={frecuencia} setter={setFrecuencia} />
                </View>
              </View>

              {/* Resumen de Cálculo */}
              <View style={[styles.summaryCard, { backgroundColor: colors.success + "08", borderColor: colors.success + "25" }]}>
                  <View style={styles.summaryHeader}>
                    <Icon name="calculator" size={16} color={colors.success} />
                    <Text style={[styles.summaryTitle, { color: colors.success }]}>Resumen del Préstamo</Text>
                  </View>
                  <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Interés</Text>
                      <Text style={[styles.summaryValue, { color: colors.accent }]}>+ ${montoInteres.toLocaleString()}</Text>
                  </View>
                  <View style={[styles.summaryRow, { marginTop: 8 }]}>
                      <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total a Cobrar</Text>
                      <Text style={[styles.summaryTotal, { color: colors.success }]}>${montoTotal.toLocaleString()}</Text>
                  </View>
                  <View style={styles.quoteBox}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                         <Icon name="info" size={12} color={colors.textSecondary} style={{ marginRight: 6 }} />
                         <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Valor Cuota:</Text>
                      </View>
                      <Text style={[styles.summaryValue, { color: colors.textPrimary, fontSize: 18 }]}>
                        ${valorCuota.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                      </Text>
                  </View>
              </View>

              <TouchableOpacity 
                style={[styles.button, { backgroundColor: colors.primary, shadowColor: colors.primary }, loading && styles.disabled]} 
                onPress={handleCreate}
                disabled={loading}
              >
                <Text style={[styles.buttonText, { color: colors.textLight }]}>
                    {loading ? "PROCESANDO..." : "CONFIRMAR PRÉSTAMO"}
                </Text>
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
  content: { padding: 24, paddingTop: 40 },
  backButton: { width: 40, height: 40, justifyContent: 'center', marginBottom: 10 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: "bold" },
  row: { flexDirection: "row", marginBottom: 5 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  chip: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginTop: 10 },
  chipText: { fontSize: 11, fontWeight: "bold" },
  formCard: { borderRadius: 24, padding: 24, borderWidth: 1 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: "600", marginLeft: 6 },
  amountInput: { fontSize: 40, fontWeight: "bold", borderBottomWidth: 1, paddingBottom: 10 },
  input: { borderWidth: 1, padding: 15, borderRadius: 14, fontSize: 16, fontWeight: '600' },
  frecuenciaRow: { flexDirection: "row" },
  frecuenciaOption: { flex: 1, paddingVertical: 12, alignItems: "center", borderWidth: 1, borderRadius: 12, marginHorizontal: 3 },
  frecuenciaText: { fontSize: 11, fontWeight: "bold" },
  summaryCard: { padding: 20, borderRadius: 20, borderWidth: 1, marginBottom: 24, marginTop: 10 },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  summaryTitle: { fontSize: 14, fontWeight: 'bold', marginLeft: 8 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryLabel: { fontSize: 13 },
  summaryValue: { fontSize: 15, fontWeight: "bold" },
  summaryTotal: { fontSize: 24, fontWeight: "bold" },
  quoteBox: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', marginTop: 15, paddingTop: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  button: { padding: 20, borderRadius: 18, alignItems: "center", shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  disabled: { opacity: 0.5 },
  buttonText: { fontSize: 15, fontWeight: "bold", letterSpacing: 1 },
});
