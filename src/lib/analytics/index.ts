import { overviewAnalytics } from "./overview";
import { revenueAnalytics } from "./revenue";
import { ordersAnalytics } from "./orders";
import { productsAnalytics } from "./products";
import { stockAnalytics } from "./stock";
import { customersAnalytics } from "./customers";
import { couponsAnalytics } from "./coupons";

type AnalyticsInput = {
  orders: any[];
  products: any[];
  customers: any[];
  coupons: any[];
  categories: any[];
  taxes: any[];
};

export function buildAnalytics(data: AnalyticsInput) {
  return {
    overview: overviewAnalytics(data.orders, data.customers),
    revenue: revenueAnalytics(data.orders),
    orders: ordersAnalytics(data.orders),
    products: productsAnalytics(data.orders),
    stock: stockAnalytics(data.products),
    customers: customersAnalytics(data.orders),
    coupons: couponsAnalytics(data.orders),
  };
}
