import api from "../api/axios";
import { Cliente } from "../types";

export const clientService = {
  getClients: async (): Promise<Cliente[]> => {
    const response = await api.get("/clientes/");
    return response.data;
  },

  createClient: async (data: Omit<Cliente, "id" | "usuario_id">): Promise<Cliente> => {
    const response = await api.post("/clientes/", data);
    return response.data;
  },

  getClientById: async (id: number): Promise<Cliente & { prestamos: any[] }> => {
    const response = await api.get(`/clientes/${id}`);
    return response.data;
  },
};
