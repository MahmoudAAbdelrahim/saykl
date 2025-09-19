// src/models/Product.ts
import mongoose, { Schema, Document, models } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  ownerId: string;
  status: "pending" | "approved" | "rejected";
  message: string;
  images: string[]; // ✅ Array of image URLs
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    ownerId: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    message: { type: String, default: "" },
    images: { type: [String], required: true }, // ✅
  },
  { timestamps: true }
);

export default models.Product || mongoose.model<IProduct>("Product", ProductSchema);
