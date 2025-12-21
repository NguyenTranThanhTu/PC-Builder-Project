import { z } from "zod";
import type { ValueType } from "@prisma/client";

// Base product fields
export const productBaseSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm là bắt buộc"),
  description: z.string().optional().nullable(),
  priceCents: z.number().int().nonnegative(),
  stock: z.number().int().min(0).default(0),
  imageUrl: z.preprocess(
    (val) => {
      // Normalize empty values to null
      if (val === "" || val === null || val === undefined) return null;
      // Ensure path starts with / if it's a relative path
      if (typeof val === "string" && !val.startsWith("http") && !val.startsWith("/")) {
        return `/${val}`;
      }
      return val;
    },
    z.union([
      z.string().url("URL ảnh không hợp lệ"),
      z.string().regex(/^\//, "Path ảnh phải bắt đầu bằng /")
    ]).nullable()
  ),
  imageBlurData: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : val),
    z.string().nullable()
  ),
  featured: z.boolean().optional().default(false),
  categoryId: z.string().min(1, "Cần chọn danh mục"),
  slug: z.string().min(1).optional(), // có thể generate ở server nếu không truyền
  status: z.enum(["DRAFT", "PUBLISHED", "OUT_OF_STOCK", "DISCONTINUED", "ARCHIVED"]).optional(),
  
  // Brand & Product Info
  brand: z.string().min(1).optional().nullable(),
  manufacturer: z.string().optional().nullable(),
  modelNumber: z.string().optional().nullable(),
  warranty: z.string().optional().nullable(),
  
  // SEO
  metaTitle: z.string().max(100).optional().nullable(), // Tăng lên 100 để phù hợp tên sản phẩm dài (RAM, GPU...)
  metaDescription: z.string().max(200).optional().nullable(), // Tăng lên 200 để mô tả đầy đủ hơn
});

// Attribute payload from form
export const attributeSchema = z.object({
  key: z.string().min(1),
  stringValue: z.string().optional().nullable(),
  numberValue: z.number().optional().nullable(),
});

export const productCreateSchema = productBaseSchema.extend({
  attributes: z.array(attributeSchema).default([]),
});

export const productUpdateSchema = productCreateSchema
  .partial()
  .extend({
    id: z.string().min(1),
    updatedAt: z.string().datetime().optional(),
  });

// Runtime helper: validate attribute values against expected ValueType map (by key)
export function validateAttributesAgainstTypes(
  attrs: Array<z.infer<typeof attributeSchema>>,
  expected: Record<string, ValueType>
) {
  for (const a of attrs) {
    const t = expected[a.key];
    if (!t) continue; // allow unknown keys to pass or handle separately
    if (t === "STRING") {
      if (a.stringValue == null || a.stringValue === "") {
        throw new Error(`Thuộc tính ${a.key} cần giá trị chuỗi`);
      }
      a.numberValue = null as any;
    } else if (t === "NUMBER") {
      if (a.numberValue == null || Number.isNaN(a.numberValue as number)) {
        throw new Error(`Thuộc tính ${a.key} cần giá trị số`);
      }
      a.stringValue = null as any;
    }
  }
  return attrs;
}
