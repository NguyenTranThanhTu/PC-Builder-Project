import { evaluateCompatibility } from './compatibility';

// Mock data helpers
function mockProduct({ id, categoryId, attributes }) {
  return {
    id,
    categoryId,
    attributes: attributes.map(a => ({
      attributeTypeId: a.key,
      numberValue: typeof a.value === 'number' ? a.value : null,
      stringValue: typeof a.value === 'string' ? a.value : null,
      attributeType: { valueType: typeof a.value === 'number' ? 'NUMBER' : 'STRING', label: a.label, key: a.key },
    })),
    category: { id: categoryId, slug: categoryId },
  };
}

// Mock rules
function mockRule({ id, leftCategoryId, rightCategoryId, leftAttrType, rightAttrType, operator }) {
  return {
    id,
    leftCategoryId,
    rightCategoryId,
    leftAttributeTypeId: leftAttrType.key,
    rightAttributeTypeId: rightAttrType.key,
    operator,
    leftAttrType,
    rightAttrType,
  };
}

describe('evaluateCompatibility', () => {
  it('should detect when total RAM modules exceed mainboard slots', async () => {
    const ramAttr = { key: 'RAM_MODULES', label: 'Số thanh RAM', value: 1 };
    const mbAttr = { key: 'MB_RAM_SLOTS', label: 'Số khe RAM', value: 2 };
    const ram1 = mockProduct({ id: 'ram1', categoryId: 'ram', attributes: [ramAttr] });
    const ram2 = mockProduct({ id: 'ram2', categoryId: 'ram', attributes: [ramAttr] });
    const ram3 = mockProduct({ id: 'ram3', categoryId: 'ram', attributes: [ramAttr] });
    const mb = mockProduct({ id: 'mb1', categoryId: 'mainboard', attributes: [mbAttr] });
    const rule = mockRule({
      id: 'rule1',
      leftCategoryId: 'ram',
      rightCategoryId: 'mainboard',
      leftAttrType: ram1.attributes[0].attributeType,
      rightAttrType: mb.attributes[0].attributeType,
      operator: 'LTE',
    });
    // Patch evaluateCompatibility to accept mock data (hoặc tách logic so sánh ra hàm thuần để test)
    // ...
  });

  it('should detect when total RAM capacity exceeds mainboard max', async () => {
    // Giả lập 2 thanh RAM, mỗi thanh 32GB, mainboard chỉ hỗ trợ 32GB
    // ...mock data và gọi evaluateCompatibility, kiểm tra issues trả về
  });

  it('should detect form factor mismatch between mainboard and case', async () => {
    // Giả lập mainboard ATX, case Micro-ATX
    // ...mock data và gọi evaluateCompatibility, kiểm tra issues trả về
  });

  it('should pass when all rules are satisfied', async () => {
    // Giả lập các linh kiện hoàn toàn tương thích
    // ...mock data và gọi evaluateCompatibility, kiểm tra issues trả về
  });
});

// Lưu ý: Cần mock prisma hoặc tách logic so sánh ra hàm thuần để test không phụ thuộc DB.