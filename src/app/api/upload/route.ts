import { NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // مهم جدًا عشان نستقبل ملفات
  },
};

export async function POST(req: Request) {
  try {
    const form = new formidable.IncomingForm();
    const data: any = await new Promise((resolve, reject) => {
      form.parse(req as any, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const file = data.files.file;
    const fileContent = fs.readFileSync(file.filepath);

    const formData = new FormData();
    formData.append("file", new Blob([fileContent]));
    formData.append("upload_preset", "unsigned_dashboard");
    formData.append("folder", "products");

    // استخدم fetch المدمج
    const cloudRes = await fetch("https://api.cloudinary.com/v1_1/dfbadbos5/image/upload", {
      method: "POST",
      body: formData,
    });

    const cloudData = await cloudRes.json();
    if (!cloudRes.ok || !cloudData.secure_url) throw new Error("Cloudinary upload failed");

    return NextResponse.json({ url: cloudData.secure_url });
  } catch (err: unknown) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
