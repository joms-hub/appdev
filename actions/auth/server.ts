"use server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs"; // ✅ bcryptjs instead of bcrypt

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

/**
 * Handles user sign-up (registration).
 */
// ✅ SERVER ACTION — no client calls here
export async function signUp(
  prevState: string | undefined,
  formData: FormData
): Promise<string> {
  try {
    const data = Object.fromEntries(formData.entries());
    const { email, password, firstName, lastName } = signUpSchema.parse(data);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return "User already exists.";

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
      },
    });

    return "Success!";
  } catch (err) {
    if (err instanceof z.ZodError) {
      return err.issues?.[0]?.message ?? "Invalid input.";
    }

    if (process.env.NODE_ENV === "development") { console.error("Signup error:", err); }
    return "Something went wrong.";
  }
}