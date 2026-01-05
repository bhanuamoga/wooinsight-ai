export function customersAnalytics(orders: any[]) {
  const spendMap: Record<string, number> = {};

  for (const o of orders) {
    const email = o.billing?.email;
    if (!email) continue;

    spendMap[email] =
      (spendMap[email] || 0) + Number(o.total);
  }

  const customers = Object.entries(spendMap)
    .map(([email, totalSpent]) => ({
      email,
      totalSpent,
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent);

  return {
    totalCustomers: customers.length,
    topCustomers: customers.slice(0, 5),
  };
}
