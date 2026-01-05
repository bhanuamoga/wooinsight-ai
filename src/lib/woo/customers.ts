import { fetchAll } from "./client";

export const getCustomers = () =>
  fetchAll<any>("customers");
