import mongoose, { Schema, model, Document } from "mongoose";

interface IUser extends Document {
  name: string;
  email: string;
  age: number;
  mriUrl: string;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true }, 
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  mriUrl: { type: String, required: true }
});

const User = mongoose.models.User || model<IUser>("User", userSchema);
export default User;
