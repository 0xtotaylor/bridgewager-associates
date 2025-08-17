import { z } from "zod";

/**
 * Ability parameters schema - defines the input parameters for the Polymarket bet ability
 */
export const abilityParamsSchema = z.object({
  tokenID: z.string().min(1, "Token ID is required"),
  side: z.enum(["BUY", "SELL"], {
    errorMap: () => ({ message: "Side must be BUY or SELL" }),
  }),
  price: z
    .number()
    .min(0.01)
    .max(0.99)
    .or(z.string().regex(/^\d*\.?\d+$/))
    .transform((val) => typeof val === "string" ? parseFloat(val) : val)
    .refine((val) => val >= 0.01 && val <= 0.99, "Price must be between 0.01 and 0.99"),
  size: z
    .number()
    .positive()
    .or(z.string().regex(/^\d*\.?\d+$/))
    .transform((val) => typeof val === "string" ? parseFloat(val) : val)
    .refine((val) => val > 0, "Size must be greater than 0"),
  privateKey: z.string().min(1, "Private key is required"),
  funderAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid funder address").optional(),
  orderType: z.enum(["GTC", "FOK", "GTD"]).optional().default("GTC"),

  // Policy-related fields (optional, for policy validation)
  eventId: z.string().optional(),
  endDate: z.string().optional(),
  volume1yr: z.number().optional(),
  to: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address").optional(),
  amount: z.string().optional(),
});

/**
 * Precheck success result schema
 */
export const precheckSuccessSchema = z.object({
  tokenIdValid: z.boolean(),
  sideValid: z.boolean(),
  priceValid: z.boolean(),
  sizeValid: z.boolean(),
  privateKeyValid: z.boolean(),
});

/**
 * Precheck failure result schema
 */
export const precheckFailSchema = z.object({
  error: z.string(),
});

/**
 * Execute success result schema
 */
export const executeSuccessSchema = z.object({
  success: z.boolean(),
  orderId: z.string().optional(),
  orderID: z.string().optional(),
  status: z.string().optional(),
  timestamp: z.number(),
});

/**
 * Execute failure result schema
 */
export const executeFailSchema = z.object({
  error: z.string(),
});

// Type exports
export type AbilityParams = z.infer<typeof abilityParamsSchema>;
export type PrecheckSuccess = z.infer<typeof precheckSuccessSchema>;
export type PrecheckFail = z.infer<typeof precheckFailSchema>;
export type ExecuteSuccess = z.infer<typeof executeSuccessSchema>;
export type ExecuteFail = z.infer<typeof executeFailSchema>;
