// src/app/api/client/products/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import Product, { IProduct } from "../../../../backend/models/Product";

interface ProductRequestBody {
  name: string;
  description: string;
  price: number;
  category: string;
  ownerId: string;
  images: string[];
  status?: "pending" | "approved" | "rejected";
  message?: string;
  createdAt?: string;
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body: ProductRequestBody = await req.json();

    const { name, description, price, category, ownerId, images } = body;

if (!name || !description || !price || !category || !ownerId || !images || images.length === 0) {
  return NextResponse.json({ error: "Missing fields" }, { status: 400 });
}



const newProduct: IProduct = await Product.create({
  name,
  description,
  price,
  category,
  ownerId,
  images,
  status: "pending",
  message: "",
  createdAt: new Date(),
});


    return NextResponse.json({ product: newProduct }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
