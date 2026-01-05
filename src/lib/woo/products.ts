import { fetchAll } from "./client";

export const getProducts = () =>
  fetchAll<any>("products");

export const getProductVariations = (productId: number) =>
  fetchAll<any>(`products/${productId}/variations`);
