// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/backend/models/User";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
const { name, email, phone, password, role } = await req.json();

if (!["client", "craftsman", "admin"].includes(role)) {
  return NextResponse.json({ error: "Invalid role" }, { status: 400 });
}


    // التحقق من وجود المستخدم مسبقًا
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }
    
const newUser = await User.create({ name, email, phone, password, role });

    // إنشاء المستخدم

    return NextResponse.json({ message: "User created successfully", userId: newUser._id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
