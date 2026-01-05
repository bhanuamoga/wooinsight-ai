export function overviewAnalytics(
  orders: any[],
  customers: any[]
) {
  return {
    totalOrders: orders.length,
    totalCustomers: customers.length,
  };
}
