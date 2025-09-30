import { NextResponse } from "next/server";
import products from "@/app/constants/cleaned_products.json";
export interface ProductType {
  company_name: string;
  product: string;
  export_to: string;
  net_price: number;
  website: string;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.toLowerCase() || "";

  const results = products.filter((item) =>
    (item.product || "").toLowerCase().includes(query)
  );

  return NextResponse.json(results);
}
