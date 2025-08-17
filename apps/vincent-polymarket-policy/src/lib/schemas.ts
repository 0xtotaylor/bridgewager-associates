import { z } from "zod";

/**
 * Ability parameters schema - matches the ability this policy works with
 */
export const abilityParamsSchema = z.object({
  eventId: z.string(),
  endDate: z.string(),
  volume1yr: z.number(),
});

/**
 * User parameters schema - policy configuration set by the user
 */
export const userParamsSchema = z.object({
  allowedEventIds: z.array(z.string()).optional(),
  maxDaysUntilEnd: z.number(),
  minVolume: z.number(),
});

/**
 * Commit parameters schema - data passed to commit phase
 */
export const commitParamsSchema = z.object({
  eventId: z.string(),
  endDate: z.string(),
  volume1yr: z.number(),
  daysUntilEnd: z.number(),
});

/**
 * Precheck allow result schema
 */
export const precheckAllowResultSchema = z.object({
  eventId: z.string(),
  eventIdValid: z.boolean(),
});

/**
 * Precheck deny result schema
 */
export const precheckDenyResultSchema = z.object({
  reason: z.string(),
  eventId: z.string(),
  allowedEventIds: z.array(z.string()),
});

/**
 * Evaluate allow result schema
 */
export const evalAllowResultSchema = z.object({
  eventId: z.string(),
  endDate: z.string(),
  volume1yr: z.number(),
  daysUntilEnd: z.number(),
  validations: z.object({
    eventIdValid: z.boolean(),
    endDateValid: z.boolean(),
    volumeValid: z.boolean(),
  }),
});

/**
 * Evaluate deny result schema
 */
export const evalDenyResultSchema = z.object({
  reason: z.string(),
  eventId: z.string(),
  failedCheck: z.enum(["eventId", "endDate", "volume"]),
  details: z.object({
    actual: z.union([z.number(), z.string()]),
    required: z.union([z.number(), z.string(), z.array(z.string())]),
  }),
});

/**
 * Commit allow result schema
 */
export const commitAllowResultSchema = z.object({
  success: z.boolean(),
  eventId: z.string(),
  message: z.string(),
});

/**
 * Commit deny result schema (though commit rarely denies)
 */
export const commitDenyResultSchema = z.object({
  reason: z.string(),
});

// Type exports
export type AbilityParams = z.infer<typeof abilityParamsSchema>;
export type UserParams = z.infer<typeof userParamsSchema>;
export type CommitParams = z.infer<typeof commitParamsSchema>;
export type PrecheckAllow = z.infer<typeof precheckAllowResultSchema>;
export type PrecheckDeny = z.infer<typeof precheckDenyResultSchema>;
export type EvalAllow = z.infer<typeof evalAllowResultSchema>;
export type EvalDeny = z.infer<typeof evalDenyResultSchema>;
export type CommitAllow = z.infer<typeof commitAllowResultSchema>;
export type CommitDeny = z.infer<typeof commitDenyResultSchema>;
