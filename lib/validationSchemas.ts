import { z } from "zod";

/**
 * Common validation rules
 */
const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address")
  .toLowerCase();

const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters long");

const strongPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/\d/, "Password must contain a number")
  .regex(/[!@#$%^&*(),.?":{}|<>\-_]/, "Password must contain a special character");

const nameSchema = z
  .string()
  .min(1, "Name is required")
  .min(2, "Name must be at least 2 characters long")
  .max(100, "Name must be less than 100 characters")
  .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes")
  .transform((val) => val.trim());

/**
 * Admin Login Form Schema
 */
export const adminLoginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

/**
 * Add Sub Admin Form Schema
 */
export const addSubAdminSchema = z
  .object({
    email: emailSchema,
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type AddSubAdminInput = z.infer<typeof addSubAdminSchema>;

/**
 * Forgot Password Form Schema
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset Password Form Schema
 */
export const resetPasswordSchema = z
  .object({
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * Mobile User Registration Schema
 */
export const mobileRegisterSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type MobileRegisterInput = z.infer<typeof mobileRegisterSchema>;

/**
 * Mobile Login Schema
 */
export const mobileLoginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type MobileLoginInput = z.infer<typeof mobileLoginSchema>;

/**
 * Saved Place Schema
 */
export const savedPlaceSchema = z.object({
  name: z
    .string()
    .min(1, "Place name is required")
    .min(2, "Place name must be at least 2 characters")
    .max(100, "Place name must be less than 100 characters"),
  latitude: z
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  longitude: z
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
  address: z
    .string()
    .min(1, "Address is required")
    .max(255, "Address must be less than 255 characters")
    .optional(),
});

export type SavedPlaceInput = z.infer<typeof savedPlaceSchema>;

/**
 * Mobile Auth - Google OAuth Schema
 */
export const googleAuthSchema = z.object({
  token: z.string().min(1, "Google token is required"),
  name: nameSchema.optional(),
  email: emailSchema,
});

export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;

/**
 * Profile Update Schema (for mobile users)
 */
export const profileUpdateSchema = z.object({
  name: nameSchema,
  email: emailSchema,
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

/**
 * Password Change Schema
 */
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;

/**
 * Validation helper for API routes
 */
export function validateInput<T extends z.ZodType<any, any, any>>(
  schema: T,
  data: unknown
):
  | { success: true; data: z.infer<T> }
  | { success: false; errors: Record<string, string[]> } {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors: Record<string, string[]> = {};
    result.error.errors.forEach((err) => {
      const key = err.path.join(".");
      if (!errors[key]) errors[key] = [];
      errors[key].push(err.message);
    });
    return { success: false, errors };
  }

  return { success: true, data: result.data };
}

/**
 * Format validation errors for API response
 */
export function formatValidationError(errors: Record<string, string[]>): string {
  return Object.entries(errors)
    .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
    .join("; ");
}
