import api from "../api/axios";
import { Prestamo } from "../types";

export const loanService = {
  getPrestamos: async (): Promise<Prestamo[]> => {
    const response = await api.get("/prestamos/");
    return response.data;
  },

  createLoanForClient: async (clienteId: number, data: any): Promise<Prestamo> => {
    const response = await api.post(`/clientes/${clienteId}/prestamos`, data);
    return response.data;
  },
};
