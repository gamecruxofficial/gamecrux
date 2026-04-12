"use server";

import { signIn } from "@/auth";
import { signUp } from "@/auth";
import { signUpSchema } from "@/lib/zod";
import { ZodError } from "zod";
import { AuthError } from "next-auth";
import { db } from "@/db/index";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";

export async function checkUsername(username: string): Promise<boolean> {
  if (username.length < 3) {
    return false;
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  return !existingUser;
}

export async function checkProvider(email: string): Promise<'google' | 'discord' | 'credentials' | null> {
  // Check if user exists with this email
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!existingUser) {
    return null;
  }

  // Only return if provider is one of the allowed values
  if (existingUser.provider === 'google' ||
      existingUser.provider === 'discord' ||
      existingUser.provider === 'credentials') {
    return existingUser.provider;
  }

  return null;
}




export async function signUpAction(
  prevState: Record<string, unknown>,
  formData: FormData
) {
  try {
    // Extract form data
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Check if all fields are filled
    if (!username || !email || !password) {
      return { error: "All fields are required", success: false };
    }

    // Validate form data using Zod
    const validatedData = await signUpSchema.parseAsync({ username, email, password });

    // Check for duplicate username or email
    const existingUser = await db.query.users.findFirst({
      where: or(eq(users.email, email), eq(users.username, username)),
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return { error: "User with this email already exists", success: false };
      }
      if (existingUser.username === username) {
        return { error: "User with this username already exists", success: false };
      }
    }

    // Call your existing signUp function
    const newUser = await signUp(validatedData);

    // Sign in the user after successful sign up
    const result = await signIn("credentials", {
      redirect: false,
      email: newUser.email,
      password: password,
    });

    if (result?.error) {
      return { error: "Failed to sign in after sign up", success: false };
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