"use server";

import { signIn } from "@/auth";
import { signInSchema } from "@/lib/zod";
import { AuthError } from "next-auth";
import { ZodError } from "zod";
import { db } from "@/db/index";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function signInAction(
  prevState: Record<string, unknown>,
  formData: FormData
) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Check if all fields are filled
    if (!email || !password) {
      return { error: "All fields are required", success: false };
    }

    // Validate form data using Zod
    const validatedData = await signInSchema.parseAsync({ email, password });

    // Check if the email exists in the database
    const user = await db.query.users.findFirst({
      where: eq(users.email, validatedData.email),
    });

    if (!user) {
      return { error: "Email not found. Please sign up.", success: false };
    }

    // Check if the user signed up with a different provider
    if (user.provider && user.provider !== "credentials") {
      return {
        error: `This email is already associated with a ${user.provider} account. Please sign in with ${user.provider}.`,
        success: false,
      };
    }

    // Attempt to sign in
    const result = await signIn("credentials", {
      redirect: false,
      email: validatedData.email,
      password: validatedData.password,
    });

    // Handle sign-in errors
    if (result?.error) {
      if (result.error === "CredentialsSignin") {
        return { error: "Incorrect password. Please try again.", success: false };
      }
      return { error: "Authentication failed. Please try again.", success: false };
    }

    return {
      error: null,
      success: true,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      // Handle Zod validation errors
      const firstError = error.errors[0];
      return {
        error: firstError.message, // Return the first validation error message
        success: false,
      };
    }
    if (error instanceof AuthError) {
      // Handle NextAuth.js authentication errors
      return {
        error: "Authentication failed. Please try again.",
        success: false,
      };
    }
    if (error instanceof Error) {
      // Handle other custom errors
      return {
        error: error.message,
        success: false,
      };
    }
    // Handle unexpected errors
    return {
      error: "An unexpected error occurred. Please try again.",
      success: false,
    };
  }
}