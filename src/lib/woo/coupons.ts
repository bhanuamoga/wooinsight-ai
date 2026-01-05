import { fetchAll } from "./client";

export const getCoupons = () =>
  fetchAll<any>("coupons");
