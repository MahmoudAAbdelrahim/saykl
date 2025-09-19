// src/app/api/admin/products/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import Product, { IProduct } from "../../../../backend/models/Product";
import User, { IUser } from "../../../../backend/models/User";

interface ProductWithOwner extends Omit<IProduct, "ownerId"> {
  owner: {
    name: string;
    email: string;
  } | null;
}

// ✅ Get all products
export async function GET() {
  try {
    await connectDB();

    const products = await Product.find().sort({ createdAt: -1 });

    // Map each product to include owner's name & email
    const productsWithOwner: ProductWithOwner[] = await Promise.all(
      products.map(async (p) => {
        const owner: IUser | null = await User.findById(p.ownerId).select("name email");
        return {
          ...p.toObject(),
          owner: owner ? { name: owner.name, email: owner.email } : null,
        };
      })
    );

    return NextResponse.json({ success: true, products: productsWithOwner });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ GET products error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
    }

    // هانشيل id من البودي ونسيب الباقي عشان يتعمله update
    const { id, ...updateData } = body;

    // Validation أساسي: ماينفعش الداتا تكون فاضية
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ PUT product error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


// ✅ Delete product
export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing product id" }, { status: 400 });

    await Product.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ DELETE product error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
