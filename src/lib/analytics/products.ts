export function productsAnalytics(orders: any[]) {
  const map: Record<number, any> = {};

  for (const o of orders) {
    for (const item of o.line_items || []) {
      if (!map[item.product_id]) {
        map[item.product_id] = {
          productId: item.product_id,
          name: item.name,
          quantity: 0,
          revenue: 0,
        };
      }

      map[item.product_id].quantity += item.quantity;
      map[item.product_id].revenue += Number(item.total);
    }
  }

  const products = Object.values(map);

  products.sort(
    (a: any, b: any) => b.quantity - a.quantity
  );

  return {
    topProducts: products.slice(0, 5),
    allProducts: products,
  };
}
