import PCBuilderClient from "@/components/PCBuilder/PCBuilderClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PC Builder | NextCommerce",
  description: "Tự lắp cấu hình PC với gợi ý tương thích",
};

export default function PCBuilderPage() {
  return <PCBuilderClient />;
}
