import { z } from "zod";

// Common error messages
const requiredFieldMessage = "This field is required";

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, { message: requiredFieldMessage })
    .email("Invalid email address"),
  password: z
    .string()
    .min(1, { message: requiredFieldMessage })
    .min(6, "Password must be at least 6 characters long")
    .max(50, "Password cannot exceed 50 characters"),
});

export const signUpSchema = z.object({
  username: z
    .string()
    .min(1, { message: requiredFieldMessage })
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username cannot exceed 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  email: z
    .string()
    .min(1, { message: requiredFieldMessage })
    .email("Invalid email address"),
  password: z
    .string()
    .min(1, { message: requiredFieldMessage })
    .min(6, "Password must be at least 6 characters long")
    .max(50, "Password cannot exceed 50 characters")
    // .regex(
    //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
    //   "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    // ),
});