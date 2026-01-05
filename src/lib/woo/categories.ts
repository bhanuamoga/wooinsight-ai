import { fetchAll } from "./client";

export const getCategories = () =>
  fetchAll<any>("products/categories");
