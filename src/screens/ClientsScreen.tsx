import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  SafeAreaView,
  TextInput,
  Dimensions,
  RefreshControl,
  Linking,
  Platform
} from "react-native";
import { clientService } from "../services/clientService";
import { Cliente } from "../types";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import BackgroundWrapper from "../components/BackgroundWrapper";
import { Colors } from "../theme/colors";
import { useCallback } from "react";

const { width } = Dimensions.get("window");

export default function ClientsScreen() {
  const { colors } = useTheme();
  const [clients, setClients] = useState<Cliente[]>([]);
  const [filteredClients, setFilteredClients] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const navigation = useNavigation<any>();

  useFocusEffect(
    useCallback(() => {
      fetchClients();
    }, [])
  );

  useEffect(() => {
    if (search === "") {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(c => 
        c.nombre.toLowerCase().includes(search.toLowerCase()) || 
        c.cedula.includes(search)
      );
      setFilteredClients(filtered);
    }
  }, [search, clients]);

  const fetchClients = async () => {
    try {
      const data = await clientService.getClients();
      setClients(data);
      setFilteredClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchClients();
  };

  const openMap = (direccion: string) => {
    if (!direccion) return;
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(direccion)}`,
      android: `geo:0,0?q=${encodeURIComponent(direccion)}`,
    }) || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
    
    Linking.openURL(url).catch(err => console.error("Error opening maps", err));
  };

  const renderItem = ({ item }: { item: Cliente }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.bgDark, borderColor: colors.border }]}
      onPress={() => navigation.navigate("ClientDetail", { clientId: item.id })}
    >
      <View style={styles.cardMain}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + "20" }]}>
          <Text style={[styles.avatarText, { color: colors.success }]}>
            {item.nombre.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: colors.textPrimary }]}>{item.nombre}</Text>
          <Text style={[styles.idText, { color: colors.textSecondary }]}>ID: {item.cedula}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate("CreateLoan", { clientId: item.id, clientName: item.nombre })}
        >
          <Text style={styles.actionButtonText}>Prestar</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.cardFooter, { borderTopColor: colors.border + "50" }]}>
        <View style={styles.contactInfo}>
          {item.telefono && (
            <TouchableOpacity 
              style={styles.contactItem}
              onPress={() => Linking.openURL(`tel:${item.telefono}`)}
            >
              <Text style={{ fontSize: 16 }}>📱</Text>
              <Text style={[styles.contactText, { color: colors.textSecondary }]}>{item.telefono}</Text>
            </TouchableOpacity>
          )}
          {item.direccion && (
            <TouchableOpacity 
              style={styles.contactItem}
              onPress={() => openMap(item.direccion)}
            >
              <Text style={{ fontSize: 16 }}>📍</Text>
              <Text style={[styles.contactText, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.direccion}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.center, { backgroundColor: colors.secondary }]}>
        <ActivityIndicator size="large" color={colors.success} />
      </View>
    );
  }

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Mis Clientes</Text>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate("CreateClient")}
          >
            <Text style={styles.addButtonText}>+ Nuevo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={[styles.searchInput, { backgroundColor: colors.bgDark, color: colors.textPrimary, borderColor: colors.border }]}
            placeholder="Buscar cliente..."
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <FlatList
          data={filteredClients}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.success} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>👥</Text>
              <Text style={styles.emptyText}>No se encontraron clientes</Text>
            </View>
          }
        />
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    padding: 24, 
    paddingTop: 60,
  },
  title: { fontSize: 28, fontWeight: "bold" },
  addButton: { 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 14,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  addButtonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  searchInput: {
    borderRadius: 16,
    padding: 15,
    fontSize: 15,
    borderWidth: 1,
  },
  list: { padding: 20, paddingTop: 0 },
  card: { 
    borderRadius: 24, 
    marginBottom: 16, 
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardMain: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "bold",
  },
  name: { fontSize: 18, fontWeight: "bold" },
  idText: { fontSize: 12, marginTop: 2, letterSpacing: 0.5 },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 10,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },
  cardFooter: {
    borderTopWidth: 1,
    padding: 12,
    paddingHorizontal: 16,
  },
  contactInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
    marginVertical: 4,
    maxWidth: "100%",
  },
  contactText: {
    fontSize: 13,
    marginLeft: 6,
    fontWeight: "500",
  },
  emptyContainer: { padding: 60, alignItems: "center" },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  emptyText: { textAlign: "center" },
});
