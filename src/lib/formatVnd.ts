// Unified VND currency formatting utility for all price displays
export function formatVnd(amount: number): string {
  return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
}
