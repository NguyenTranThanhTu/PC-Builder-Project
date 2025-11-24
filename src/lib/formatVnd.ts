// Unified VND currency formatting utility for all price displays
export function formatVnd(amount: number): string {
  if (amount == null || isNaN(amount)) return '0đ';
  return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
}
