import { z } from "zod";
import User from "../../model/user";
import { connectMongoDB } from "@/app/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

// Define the Zod schema for validation
const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  age: z.number().min(0, { message: "Age must be a positive number" }),
  mriUrl: z.string().url({ message: "Invalid URL for MRI" }),
});

// Infer the type from the Zod schema
type UserInput = z.infer<typeof formSchema>;

export async function POST(req: NextRequest, res: NextResponse) {
    try {
      await connectMongoDB();
      const body = await req.json();
  
      const validationResult = formSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          { error: validationResult.error.errors },
          { status: 400 }
        );
      }
  
      const { email, name, age, mriUrl }: UserInput = validationResult.data;
  
      const newUser = new User({ email, name, age, mriUrl });
      await newUser.save();
  
      return NextResponse.json(
        { message: "User created successfully", user: newUser },
        { status: 201 }
      );
    } catch (error) {
      console.error("Error:", error);
      return NextResponse.json(
        { message: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
  