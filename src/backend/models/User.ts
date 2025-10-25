import mongoose from "mongoose";
import bcrypt from "bcrypt";


export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  createdAt: Date;
  role: "client" | "craftsman" | "admin"; // ✅ ضيف craftsman هنا
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const UserSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  role: { type: String, enum: ["client", "craftsman", "admin"], default: "client" },

});

// تشفير الباسورد قبل الحفظ
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// دالة للمقارنة أثناء تسجيل الدخول
UserSchema.methods.comparePassword = function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
