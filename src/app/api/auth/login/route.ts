import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/backend/models/User";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "كل الحقول مطلوبة" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "كلمة المرور غير صحيحة" }, { status: 400 });
    }

    // هنرجع بيانات من غير الباسورد
    const { password: _, ...userData } = user.toObject();

    return NextResponse.json({ message: "تم تسجيل الدخول بنجاح", user: userData });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "مشكلة في السيرفر" }, { status: 500 });
  }
}
