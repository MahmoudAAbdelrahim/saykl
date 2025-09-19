// src/app/api/client/products/[id]/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import Product, { IProduct } from "../../../../../backend/models/Product";

interface Params {
  params: {
    id: string; // userId
  };
}

export async function GET(req: Request, { params }: Params) {
  try {
    await connectDB();
    const ownerId = params.id;

    if (!ownerId) {
      return NextResponse.json({ error: "Missing ownerId" }, { status: 400 });
    }

    const products: IProduct[] = await Product.find({ ownerId }).sort({ createdAt: -1 });

    return NextResponse.json({ products }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
