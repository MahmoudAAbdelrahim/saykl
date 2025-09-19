import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import Product, { IProduct } from "../../../../../backend/models/Product";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = context.params;

    if (!id) {
      return NextResponse.json({ error: "Missing ownerId" }, { status: 400 });
    }

    const products: IProduct[] = await Product.find({ ownerId: id }).sort({
      createdAt: -1,
    });

    return NextResponse.json({ products }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
