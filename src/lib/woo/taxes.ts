import { fetchAll } from "./client";

export const getTaxes = () =>
  fetchAll<any>("taxes");
