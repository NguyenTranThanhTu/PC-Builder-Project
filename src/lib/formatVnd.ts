// Unified VND currency formatting utility for all price displays
export function formatVnd(amount: number): string {
  if (amount == null || isNaN(amount)) return '0đ';
  return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
}

// Format cents to VND (divide by 100 automatically)
export function formatVndFromCents(cents: number): string {
  if (cents == null || isNaN(cents)) return '0đ';
  const vnd = cents / 100;
  return vnd.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
}
