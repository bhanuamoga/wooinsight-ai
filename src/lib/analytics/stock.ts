export function stockAnalytics(products: any[]) {
  let inStock = 0;
  let outOfStock = 0;
  let lowStock = 0;

  for (const p of products) {
    if (p.stock_status === "instock") inStock++;
    if (p.stock_status === "outofstock") outOfStock++;

    if (
      p.low_stock_amount !== null &&
      p.stock_quantity !== null &&
      p.stock_quantity <= p.low_stock_amount
    ) {
      lowStock++;
    }
  }

  return {
    totalProducts: products.length,
    inStock,
    outOfStock,
    lowStock,
  };
}
