import { NextResponse } from "next/server";
import { z } from "zod";
import { evaluateCompatibility } from "@/lib/compatibility";

const BodySchema = z.object({
  productIds: z.array(z.string().min(1)).min(1),
});

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => ({}));
    const parse = BodySchema.safeParse(json);
    if (!parse.success) {
      return NextResponse.json({ error: "Invalid body", details: parse.error.flatten() }, { status: 400 });
    }

    const { productIds } = parse.data;
    const result = await evaluateCompatibility(productIds);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
