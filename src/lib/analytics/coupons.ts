export function couponsAnalytics(orders: any[]) {
  const usage: Record<string, number> = {};

  for (const o of orders) {
    for (const c of o.coupon_lines || []) {
      usage[c.code] =
        (usage[c.code] || 0) + Number(c.discount);
    }
  }

  return {
    couponUsage: usage,
  };
}
