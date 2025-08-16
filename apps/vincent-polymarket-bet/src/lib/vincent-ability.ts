import {
  createVincentAbility,
  createVincentAbilityPolicy,
  supportedPoliciesForAbility,
} from "@lit-protocol/vincent-ability-sdk";
import { bundledVincentPolicy } from "../../../polymarket-policy/dist/index.js";

import {
  executeFailSchema,
  executeSuccessSchema,
  precheckFailSchema,
  precheckSuccessSchema,
  abilityParamsSchema,
} from "./schemas.js";

import { laUtils } from "@lit-protocol/vincent-scaffold-sdk";

const SendLimitPolicy = createVincentAbilityPolicy({
  abilityParamsSchema,
  bundledVincentPolicy,
  abilityParameterMappings: {
    to: "to",
    amount: "amount",
  },
});

export const vincentAbility = createVincentAbility({
  packageName: "@agentic-ai/vincent-ability-polymarket-bet" as const,
  abilityDescription: "A polymarket bet ability that provides functionality for polymarket bet operations",
  abilityParamsSchema,
  supportedPolicies: supportedPoliciesForAbility([SendLimitPolicy]),

  precheckSuccessSchema,
  precheckFailSchema,

  executeSuccessSchema,
  executeFailSchema,

  precheck: async ({ abilityParams }, { succeed, fail }) => {
    console.log("[@agentic-ai/vincent-ability-polymarket-bet/precheck]");
    console.log("[@agentic-ai/vincent-ability-polymarket-bet/precheck] params:", {
      abilityParams,
    });

    const { to, amount, rpcUrl } = abilityParams;

    // Basic validation without using ethers directly
    if (!to || !to.startsWith("0x") || to.length !== 42) {
      return fail({
        error: "[@agentic-ai/vincent-ability-polymarket-bet/precheck] Invalid recipient address format",
      });
    }

    // Validate the amount
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return fail({
        error:
          "[@agentic-ai/vincent-ability-polymarket-bet/precheck] Invalid amount format or amount must be greater than 0",
      });
    }

    // Validate RPC URL if provided
    if (rpcUrl && typeof rpcUrl === "string") {
      try {
        new URL(rpcUrl);
      } catch {
        return fail({
          error: "[@agentic-ai/vincent-ability-polymarket-bet/precheck] Invalid RPC URL format",
        });
      }
    }

    // Additional validation: check if amount is too large
    const amountFloat = parseFloat(amount);
    if (amountFloat > 1.0) {
      return fail({
        error:
          "[@agentic-ai/vincent-ability-polymarket-bet/precheck] Amount too large (maximum 1.0 ETH per transaction)",
      });
    }

    // Precheck succeeded
    const successResult = {
      addressValid: true,
      amountValid: true,
    };

    console.log("[@agentic-ai/vincent-ability-polymarket-bet/precheck] Success result:", successResult);
    const successResponse = succeed(successResult);
    console.log(
      "[NativeSendAbility/precheck] Success response:",
      JSON.stringify(successResponse, null, 2)
    );
    return successResponse;
  },

  execute: async (
    { abilityParams },
    { succeed, fail, delegation, policiesContext }
  ) => {
    try {
      const { to, amount, rpcUrl } = abilityParams;

      console.log("[@agentic-ai/vincent-ability-polymarket-bet/execute] Executing Native Send Ability", {
        to,
        amount,
        rpcUrl,
      });

      // Get provider - use provided RPC URL or default to Yellowstone
      const finalRpcUrl = rpcUrl || "https://yellowstone-rpc.litprotocol.com/";
      const provider = new ethers.providers.JsonRpcProvider(finalRpcUrl);

      console.log("[@agentic-ai/vincent-ability-polymarket-bet/execute] Using RPC URL:", finalRpcUrl);

      // Get PKP public key from delegation context
      const pkpPublicKey = delegation.delegatorPkpInfo.publicKey;
      if (!pkpPublicKey) {
        return fail({
          error: "PKP public key not available from delegation context",
        });
      }

      // Execute the native send
      const txHash = await laUtils.transaction.handler.nativeSend({
        provider,
        pkpPublicKey,
        amount,
        to,
      });

      console.log("[@agentic-ai/vincent-ability-polymarket-bet/execute] Native send successful", {
        txHash,
        to,
        amount,
      });

      // Manually call policy commit function using the correct pattern
      console.log(
        "[@agentic-ai/vincent-ability-polymarket-bet/execute] Manually calling policy commit function..."
      );

      try {
        // Use the correct pattern from the reference code
        const sendLimitPolicyContext =
          policiesContext.allowedPolicies["@agentic-ai/vincent-policy-send-counter-limit"];

        if (
          sendLimitPolicyContext &&
          sendLimitPolicyContext.commit &&
          sendLimitPolicyContext.result
        ) {
          console.log(
            "[@agentic-ai/vincent-ability-polymarket-bet/execute] ✅ Found send limit policy context, calling commit..."
          );
          console.log(
            "[@agentic-ai/vincent-ability-polymarket-bet/execute] ✅ Policy evaluation result:",
            sendLimitPolicyContext.result
          );

          // Extract the commit parameters from the policy evaluation results
          const { currentCount, maxSends, remainingSends, timeWindowSeconds } =
            sendLimitPolicyContext.result;
          const commitParams = {
            currentCount,
            maxSends,
            remainingSends,
            timeWindowSeconds,
          };

          console.log(
            "[@agentic-ai/vincent-ability-polymarket-bet/execute] ✅ Available in sendLimitPolicyContext:",
            Object.keys(sendLimitPolicyContext)
          );
          console.log(
            "[@agentic-ai/vincent-ability-polymarket-bet/execute] ✅ Calling commit with explicit parameters (ignoring TS signature)..."
          );

          const commitResult = await sendLimitPolicyContext.commit(
            // @ts-ignore - TypeScript signature is wrong, framework actually expects parameters
            commitParams
          );
          console.log(
            "[@agentic-ai/vincent-ability-polymarket-bet/execute] ✅ Policy commit result:",
            commitResult
          );
        } else {
          console.log(
            "[@agentic-ai/vincent-ability-polymarket-bet/execute] ❌ Send limit policy context not found in policiesContext.allowedPolicies"
          );
          console.log(
            "[@agentic-ai/vincent-ability-polymarket-bet/execute] ❌ Available policies:",
            Object.keys(policiesContext.allowedPolicies || {})
          );
        }
      } catch (commitError) {
        console.error(
          "[@agentic-ai/vincent-ability-polymarket-bet/execute] ❌ Error calling policy commit:",
          commitError
        );
        // Don't fail the transaction if commit fails
      }

      return succeed({
        txHash,
        to,
        amount,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("[@agentic-ai/vincent-ability-polymarket-bet/execute] Native send failed", error);

      return fail({
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  },
});
