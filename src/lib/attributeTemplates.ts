import type { ValueType } from "@prisma/client";

export type AttributeTemplateField = {
  key: string;
  label: string;
  valueType: ValueType; // STRING | NUMBER
  placeholder?: string;
  helpText?: string;
};

export type CategoryTemplates = Record<string, AttributeTemplateField[]>; // by category slug

export const ATTRIBUTE_TEMPLATES: CategoryTemplates = {
  cpu: [
    { key: "CPU_BRAND", label: "Hãng CPU", valueType: "STRING" },
    { key: "CPU_SOCKET", label: "Socket", valueType: "STRING" },
    { key: "CPU_CORES", label: "Số nhân", valueType: "NUMBER" },
    { key: "CPU_THREADS", label: "Số luồng", valueType: "NUMBER" },
    { key: "CPU_BASE_CLOCK_GHZ", label: "Xung cơ bản (GHz)", valueType: "NUMBER" },
    { key: "CPU_BOOST_CLOCK_GHZ", label: "Xung boost (GHz)", valueType: "NUMBER" },
    { key: "CPU_TDP_WATT", label: "TDP (W)", valueType: "NUMBER" },
    { key: "CPU_MAX_MEMORY_SPEED_MHZ", label: "RAM tối đa (MHz)", valueType: "NUMBER" },
    { key: "CPU_INTEGRATED_GPU", label: "iGPU", valueType: "STRING" },
  ],
  mainboard: [
    { key: "MB_SOCKET", label: "Socket", valueType: "STRING" },
    { key: "MB_CHIPSET", label: "Chipset", valueType: "STRING" },
    { key: "MB_FORM_FACTOR", label: "Form Factor", valueType: "STRING" },
    { key: "MB_RAM_TYPE", label: "Loại RAM", valueType: "STRING" },
    { key: "MB_RAM_SLOTS", label: "Số khe RAM", valueType: "NUMBER" },
    { key: "MB_MAX_RAM_GB", label: "RAM tối đa (GB)", valueType: "NUMBER" },
    { key: "MB_MAX_RAM_SPEED_MHZ", label: "RAM tối đa (MHz)", valueType: "NUMBER" },
    { key: "MB_PCIEX16_SLOTS", label: "PCIe x16", valueType: "NUMBER" },
    { key: "MB_M2_SLOTS", label: "Khe M.2", valueType: "NUMBER" },
    { key: "MB_SATA_PORTS", label: "Cổng SATA", valueType: "NUMBER" },
    { key: "MB_WIFI", label: "Wi‑Fi", valueType: "STRING" },
    { key: "MB_BLUETOOTH", label: "Bluetooth", valueType: "STRING" },
  ],
  gpu: [
    { key: "GPU_CHIP", label: "GPU Chip", valueType: "STRING" },
    { key: "GPU_VRAM_GB", label: "VRAM (GB)", valueType: "NUMBER" },
    { key: "GPU_INTERFACE", label: "Giao tiếp", valueType: "STRING" },
    { key: "GPU_LENGTH_MM", label: "Chiều dài (mm)", valueType: "NUMBER" },
    { key: "GPU_TDP_WATT", label: "TDP (W)", valueType: "NUMBER" },
    { key: "GPU_POWER_CONNECTOR", label: "Nguồn phụ", valueType: "STRING" },
    { key: "GPU_PCIE_GEN", label: "PCIe Gen", valueType: "STRING" },
  ],
  ram: [
    { key: "RAM_TYPE", label: "Loại RAM", valueType: "STRING" },
    { key: "RAM_CAPACITY_GB", label: "Dung lượng (GB)", valueType: "NUMBER" },
    { key: "RAM_SPEED_MHZ", label: "Tốc độ (MHz)", valueType: "NUMBER" },
    { key: "RAM_MODULES", label: "Số thanh", valueType: "NUMBER" },
    { key: "RAM_CL", label: "CL", valueType: "NUMBER" },
  ],
  psu: [
    { key: "PSU_WATTAGE", label: "Công suất (W)", valueType: "NUMBER" },
    { key: "PSU_CERT", label: "Chứng nhận", valueType: "STRING" },
    { key: "PSU_FORM_FACTOR", label: "Form Factor", valueType: "STRING" },
  ],
  case: [
    { key: "CASE_FORM_FACTOR", label: "Form Factor", valueType: "STRING" },
    { key: "CASE_GPU_CLEARANCE_MM", label: "Hở GPU (mm)", valueType: "NUMBER" },
    { key: "CASE_CPU_COOLER_CLEARANCE_MM", label: "Hở tản CPU (mm)", valueType: "NUMBER" },
  ],
  storage: [
    { key: "STORAGE_TYPE", label: "Loại", valueType: "STRING" },
    { key: "STORAGE_INTERFACE", label: "Giao tiếp", valueType: "STRING" },
    { key: "STORAGE_CAPACITY_GB", label: "Dung lượng (GB)", valueType: "NUMBER" },
    { key: "STORAGE_FORM_FACTOR", label: "Kích cỡ", valueType: "STRING" },
  ],
  cooler: [
    { key: "COOLER_TYPE", label: "Loại tản", valueType: "STRING" },
    { key: "COOLER_TDP_WATT", label: "Công suất tản (W)", valueType: "NUMBER" },
    { key: "COOLER_MAX_HEIGHT_MM", label: "Cao tối đa (mm)", valueType: "NUMBER" },
    { key: "COOLER_SOCKET_COMPAT", label: "Socket hỗ trợ", valueType: "STRING" },
  ],
};

// Utility: Build quick lookup of expected value type by key
export function expectedValueTypeByKey(): Record<string, ValueType> {
  const map: Record<string, ValueType> = {};
  for (const fields of Object.values(ATTRIBUTE_TEMPLATES)) {
    for (const f of fields) map[f.key] = f.valueType;
  }
  return map;
}
