import {
  createVincentAbility,
  createVincentAbilityPolicy,
  supportedPoliciesForAbility,
} from "@lit-protocol/vincent-ability-sdk";
// import { bundledVincentPolicy } from "../../../policy-send-counter/dist/src/index.js";
import { bundledVincentPolicy } from "@bridgewager/vincent-policy-polymarket-policy";

import {
  executeFailSchema,
  executeSuccessSchema,
  precheckFailSchema,
  precheckSuccessSchema,
  abilityParamsSchema,
} from "./schemas.js";

import { placeOrder, isValidPrivateKey } from "./helpers/index.js";

const PolymarketPolicy = createVincentAbilityPolicy({
  abilityParamsSchema: abilityParamsSchema,
  bundledVincentPolicy,
  abilityParameterMappings: {
    eventId: "eventId",
    endDate: "endDate",
    volume1yr: "volume1yr",
  },
});

export const vincentAbility = createVincentAbility({
  packageName: "@bridgewager/vincent-ability-polymarket-bet" as const,
  abilityDescription: "A Polymarket bet ability that creates and places orders on Polymarket CLOB",
  abilityParamsSchema: abilityParamsSchema,
  supportedPolicies: supportedPoliciesForAbility([PolymarketPolicy]),

  precheckSuccessSchema: precheckSuccessSchema,
  precheckFailSchema: precheckFailSchema,

  executeSuccessSchema: executeSuccessSchema,
  executeFailSchema: executeFailSchema,

  precheck: async ({ abilityParams }, { succeed, fail }) => {
    console.log("[@bridgewager/vincent-ability-polymarket-bet/precheck]");
    console.log("[@bridgewager/vincent-ability-polymarket-bet/precheck] params:", {
      abilityParams,
    });

    const { tokenID, side, price, size, privateKey } = abilityParams;

    try {
      // Validate token ID
      if (!tokenID || tokenID.length === 0) {
        return fail({
          error: "[@bridgewager/vincent-ability-polymarket-bet/precheck] Token ID is required",
        });
      }

      // Validate side
      if (side !== "BUY" && side !== "SELL") {
        return fail({
          error: "[@bridgewager/vincent-ability-polymarket-bet/precheck] Side must be BUY or SELL",
        });
      }

      // Validate price
      const priceNum = typeof price === 'string' ? parseFloat(price) : price;
      if (priceNum < 0.01 || priceNum > 0.99) {
        return fail({
          error: "[@bridgewager/vincent-ability-polymarket-bet/precheck] Price must be between 0.01 and 0.99",
        });
      }

      // Validate size
      const sizeNum = typeof size === 'string' ? parseFloat(size) : size;
      if (sizeNum <= 0) {
        return fail({
          error: "[@bridgewager/vincent-ability-polymarket-bet/precheck] Size must be greater than 0",
        });
      }

      // Validate private key
      if (!privateKey || privateKey.length === 0) {
        return fail({
          error: "[@bridgewager/vincent-ability-polymarket-bet/precheck] Private key is required",
        });
      }

      if (!isValidPrivateKey(privateKey)) {
        return fail({
          error: "[@bridgewager/vincent-ability-polymarket-bet/precheck] Invalid private key format",
        });
      }

      // Precheck succeeded
      const successResult = {
        tokenIdValid: true,
        sideValid: true,
        priceValid: true,
        sizeValid: true,
        privateKeyValid: true,
      };

      console.log("[@bridgewager/vincent-ability-polymarket-bet/precheck] Success result:", successResult);
      return succeed(successResult);
    } catch (error) {
      console.error("[@bridgewager/vincent-ability-polymarket-bet/precheck] Error:", error);
      return fail({
        error: error instanceof Error ? error.message : "Unknown precheck error",
      });
    }
  },

  execute: async (
    { abilityParams },
    { succeed, fail, delegation, policiesContext }
  ) => {
    try {
      const {
        tokenID,
        side,
        price,
        size,
        privateKey,
        funderAddress,
        orderType,
        eventId,
        endDate,
        volume1yr,
      } = abilityParams;

      console.log("[@bridgewager/vincent-ability-polymarket-bet/execute] Executing Polymarket Bet Ability", {
        tokenID,
        side,
        price,
        size,
        orderType,
      });

      // Call policy commit function if available
      console.log(
        "[@bridgewager/vincent-ability-polymarket-bet/execute] Checking for policy context..."
      );

      try {
        const polymarketPolicyContext =
          policiesContext.allowedPolicies["@bridgewager/vincent-policy-polymarket-policy"];

        if (
          polymarketPolicyContext &&
          polymarketPolicyContext.commit &&
          polymarketPolicyContext.result
        ) {
          console.log(
            "[@bridgewager/vincent-ability-polymarket-bet/execute] ✅ Found Polymarket policy context, calling commit..."
          );

          // Extract the commit parameters from the policy evaluation results
          const { daysUntilEnd } = polymarketPolicyContext.result;
          const commitParams = {
            eventId,
            endDate,
            volume1yr,
            daysUntilEnd: daysUntilEnd || 0,
          };

          console.log(
            "[@bridgewager/vincent-ability-polymarket-bet/execute] ✅ Calling commit with parameters..."
          );

          const commitResult = await polymarketPolicyContext.commit(
            // @ts-ignore - TypeScript signature may be wrong
            commitParams
          );
          console.log(
            "[@bridgewager/vincent-ability-polymarket-bet/execute] ✅ Policy commit result:",
            commitResult
          );
        } else {
          console.log(
            "[@bridgewager/vincent-ability-polymarket-bet/execute] ❌ Polymarket policy context not found"
          );
          console.log(
            "[@bridgewager/vincent-ability-polymarket-bet/execute] ❌ Available policies:",
            Object.keys(policiesContext.allowedPolicies || {})
          );
        }
      } catch (commitError) {
        console.error(
          "[@bridgewager/vincent-ability-polymarket-bet/execute] ❌ Error calling policy commit:",
          commitError
        );
        // Don't fail the transaction if commit fails
      }

      // Place the order on Polymarket
      console.log("[@bridgewager/vincent-ability-polymarket-bet/execute] Placing order on Polymarket...");

      const orderConfig = {
        privateKey,
        funderAddress,
      };

      const orderData = {
        tokenID,
        side,
        price,
        size,
        orderType,
      };

      const orderResult = await placeOrder(orderData, orderConfig);
      // Response looks like this:
      // Order response: {
      //   errorMsg: '',
      //   orderID: '0x94b',
      //   takingAmount: '',
      //   makingAmount: '',
      //   status: 'live',
      //   success: true
      // }

      console.log("[@bridgewager/vincent-ability-polymarket-bet/execute] Order placed successfully:", orderResult);

      // Return the order result
      return succeed({
        success: orderResult.success,
        orderID: orderResult.orderID,
        status: orderResult.status,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("[@bridgewager/vincent-ability-polymarket-bet/execute] Order creation failed", error);

      return fail({
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  },
});