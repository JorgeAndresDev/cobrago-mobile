import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  StyleSheet
} from "react-native";
import Toast from "react-native-toast-message";
import { clientService } from "../services/clientService";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import BackgroundWrapper from "../components/BackgroundWrapper";
import { createCommonStyles } from "../styles/common.styles";

export default function CreateClientScreen() {
  const { colors } = useTheme();
  const commonStyles = createCommonStyles(colors);
  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  const handleCreate = async () => {
    if (!nombre || !cedula) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Nombre y Cédula son obligatorios'
      });
      return;
    }

    setLoading(true);
    try {
      await clientService.createClient({ nombre, cedula, telefono, direccion });
      Toast.show({
        type: 'success',
        text1: '¡Éxito!',
        text2: 'Cliente creado correctamente'
      });
      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo crear el cliente'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <TouchableOpacity 
            style={commonStyles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={commonStyles.backButtonText}>‹ Volver</Text>
          </TouchableOpacity>

          <Text style={[styles.title, { color: colors.textPrimary }]}>Nuevo Cliente</Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Nombre Completo</Text>
            <TextInput 
              style={[styles.input, { borderColor: colors.border, backgroundColor: colors.bgDark, color: colors.textPrimary }]} 
              value={nombre} 
              onChangeText={setNombre} 
              placeholderTextColor={colors.textSecondary} 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Cédula / DNI</Text>
            <TextInput 
              style={[styles.input, { borderColor: colors.border, backgroundColor: colors.bgDark, color: colors.textPrimary }]} 
              value={cedula} 
              onChangeText={setCedula} 
              placeholderTextColor={colors.textSecondary} 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Teléfono</Text>
            <TextInput 
              style={[styles.input, { borderColor: colors.border, backgroundColor: colors.bgDark, color: colors.textPrimary }]} 
              value={telefono} 
              onChangeText={setTelefono} 
              placeholderTextColor={colors.textSecondary} 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Dirección</Text>
            <TextInput 
              style={[styles.input, { borderColor: colors.border, backgroundColor: colors.bgDark, color: colors.textPrimary }]} 
              value={direccion} 
              onChangeText={setDireccion} 
              placeholderTextColor={colors.textSecondary} 
            />
            <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 4, marginLeft: 4 }}>
              💡 Tip: Puedes pegar coordenadas o el nombre del negocio para mayor exactitud.
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.primary }, loading && styles.disabled]} 
            onPress={handleCreate}
            disabled={loading}
          >
            <Text style={[styles.buttonText, { color: colors.textLight }]}>{loading ? "Creando..." : "Guardar Cliente"}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 30 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8, marginLeft: 4 },
  input: { borderWidth: 1, padding: 15, borderRadius: 14, fontSize: 16 },
  button: { padding: 18, borderRadius: 16, alignItems: "center", marginTop: 20 },
  disabled: { opacity: 0.7 },
  buttonText: { fontSize: 16, fontWeight: "bold" },
});
