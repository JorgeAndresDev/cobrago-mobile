import api from "../api/axios";

export interface PaymentData {
  prestamo_id: number;
  monto: number;
  comentario: string;
}

export const paymentService = {
  createPayment: async (data: PaymentData) => {
    const response = await api.post("/pagos/", data);
    return response.data;
  },
};
