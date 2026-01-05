export function revenueAnalytics(orders: any[]) {
  let gross = 0;
  let refunds = 0;
  let tax = 0;
  let shipping = 0;
  let discount = 0;

  for (const o of orders) {
    if (["processing", "completed"].includes(o.status)) {
      gross += Number(o.total);
      tax += Number(o.total_tax);
      shipping += Number(o.shipping_total);
      discount += Number(o.discount_total);
    }

    if (o.refunds) {
      for (const r of o.refunds) {
        refunds += Number(r.amount);
      }
    }
  }

  return {
    grossRevenue: gross,
    refundTotal: refunds,
    netRevenue: gross - refunds,
    taxCollected: tax,
    shippingCollected: shipping,
    discountTotal: discount,
  };
}
