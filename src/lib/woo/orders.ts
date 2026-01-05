import { fetchAll } from "./client";

export const getOrders = (params: Record<string, string> = {}) =>
  fetchAll<any>("orders", params);

export const getOrderRefunds = (orderId: number) =>
  fetchAll<any>(`orders/${orderId}/refunds`);
