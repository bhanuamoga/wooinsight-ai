export function ordersAnalytics(orders: any[]) {
  const byStatus: Record<string, number> = {};

  for (const o of orders) {
    byStatus[o.status] = (byStatus[o.status] || 0) + 1;
  }

  return {
    totalOrders: orders.length,
    byStatus,
  };
}
