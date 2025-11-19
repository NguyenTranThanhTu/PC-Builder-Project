import React from 'react';
import { buildSpecRows } from '@/lib/productAdapter';

// Server-safe presentational component; expects full product with attributes + category
export function ProductSpecsTable({ product }: { product: any }) {
  const rows = buildSpecRows(product);
  if (!rows.length) return null;
  return (
    <div className="mt-8 border border-gray-3 rounded-lg overflow-hidden">
      <div className="px-4 py-2 bg-gray-2 font-semibold text-sm">Thông số kỹ thuật</div>
      <table className="w-full text-sm">
        <tbody>
          {rows.map(r => (
            <tr key={r.label} className="even:bg-gray-1">
              <td className="px-4 py-2 w-1/2 text-gray-700 font-medium">{r.label}</td>
              <td className="px-4 py-2 w-1/2 text-gray-900">{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductSpecsTable;
