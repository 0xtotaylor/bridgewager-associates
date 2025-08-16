import { createVincentPolicy } from "@lit-protocol/vincent-ability-sdk";
import {
  validateEventId,
  validateEndDate,
  validateVolume,
  getValidationFailureReason,
  DEFAULT_ALLOWED_EVENT_IDS,
} from "./helpers/index";
import {
  commitAllowResultSchema,
  commitDenyResultSchema,
  commitParamsSchema,
  evalAllowResultSchema,
  evalDenyResultSchema,
  precheckAllowResultSchema,
  precheckDenyResultSchema,
  abilityParamsSchema,
  userParamsSchema,
} from "./schemas";

const PKG = "@bridgewager/vincent-policy-polymarket-policy" as const;

export const vincentPolicy = createVincentPolicy({
  packageName: PKG,

  abilityParamsSchema: abilityParamsSchema,
  userParamsSchema: userParamsSchema,
  commitParamsSchema: commitParamsSchema as any,

  precheckAllowResultSchema: precheckAllowResultSchema,
  precheckDenyResultSchema: precheckDenyResultSchema,

  evalAllowResultSchema: evalAllowResultSchema,
  evalDenyResultSchema: evalDenyResultSchema,

  commitAllowResultSchema: commitAllowResultSchema as any,
  commitDenyResultSchema: commitDenyResultSchema as any,

  precheck: async (
    { abilityParams, userParams },
    { allow, deny, appId, delegation: { delegatorPkpInfo } }
  ) => {
    console.log(`[${PKG}/precheck] 🔍 POLICY PRECHECK CALLED`);
    console.log(`[${PKG}/precheck] 🔍 Policy precheck params:`, {
      abilityParams,
      userParams,
      ethAddress: delegatorPkpInfo.ethAddress,
      appId,
    });

    const { eventId } = abilityParams;
    const { allowedEventIds } = userParams;

    try {
      // Quick validation of event ID
      const eventIdValid = validateEventId(eventId, allowedEventIds);

      if (!eventIdValid) {
        const allowedList = allowedEventIds || DEFAULT_ALLOWED_EVENT_IDS;
        const denyResult = {
          reason: `Event ID ${eventId} is not in the allowed list`,
          eventId,
          allowedEventIds: allowedList,
        };

        console.log(
          `[${PKG}/precheck] 🚫 POLICY PRECHECK DENYING REQUEST:`
        );
        console.log(
          `[${PKG}/precheck] 🚫 Deny result:`,
          JSON.stringify(denyResult, null, 2)
        );

        return deny(denyResult);
      }

      const allowResult = {
        eventId,
        eventIdValid: true,
      };

      return allow(allowResult);
    } catch (error) {
      console.error(`[${PKG}/precheck] error`, error);
      return deny({
        reason: `Policy error: ${error instanceof Error ? error.message : "Unknown error"}`,
        eventId,
        allowedEventIds: allowedEventIds || DEFAULT_ALLOWED_EVENT_IDS,
      });
    }
  },

  evaluate: async (
    { abilityParams, userParams },
    { allow, deny, appId, delegation: { delegatorPkpInfo } }
  ) => {
    console.log(`[${PKG}/evaluate] 🔍 POLICY EVALUATE CALLED`);
    console.log(`[${PKG}/evaluate] Evaluating Polymarket policy`, {
      abilityParams,
      userParams,
    });

    const { eventId, endDate, volume1yr } = abilityParams;
    const { allowedEventIds, maxDaysUntilEnd, minVolume } = userParams;

    try {
      // Validate event ID
      const eventIdValid = validateEventId(eventId, allowedEventIds);
      if (!eventIdValid) {
        const allowedList = allowedEventIds || DEFAULT_ALLOWED_EVENT_IDS;
        return deny({
          reason: getValidationFailureReason('eventId', eventId, allowedList),
          eventId,
          failedCheck: 'eventId',
          details: {
            actual: eventId,
            required: allowedList,
          },
        });
      }

      // Validate end date
      const endDateValidation = validateEndDate(endDate, maxDaysUntilEnd);
      if (!endDateValidation.valid) {
        return deny({
          reason: getValidationFailureReason('endDate', endDateValidation.daysUntilEnd, maxDaysUntilEnd),
          eventId,
          failedCheck: 'endDate',
          details: {
            actual: endDateValidation.daysUntilEnd,
            required: maxDaysUntilEnd,
          },
        });
      }

      // Validate volume
      const volumeValid = validateVolume(volume1yr, minVolume);
      if (!volumeValid) {
        return deny({
          reason: getValidationFailureReason('volume', volume1yr, minVolume),
          eventId,
          failedCheck: 'volume',
          details: {
            actual: volume1yr,
            required: minVolume,
          },
        });
      }

      // All validations passed
      const allowResult = {
        eventId,
        endDate,
        volume1yr,
        daysUntilEnd: endDateValidation.daysUntilEnd,
        validations: {
          eventIdValid: true,
          endDateValid: true,
          volumeValid: true,
        },
      };

      console.log(
        `[${PKG}/evaluate] ✅ All validations passed`
      );
      console.log(
        `[${PKG}/evaluate] ✅ Allow result:`,
        JSON.stringify(allowResult, null, 2)
      );

      return allow(allowResult);
    } catch (error) {
      console.error(`[${PKG}/evaluate] Error in evaluate:`, error);
      return deny({
        reason: `Policy error during evaluation: ${error instanceof Error ? error.message : "Unknown error"}`,
        eventId,
        failedCheck: 'eventId', // Default to eventId for errors
        details: {
          actual: eventId,
          required: "Error occurred",
        },
      });
    }
  },

  commit: async (
    { eventId, endDate, volume1yr, daysUntilEnd },
    { allow, deny, appId, delegation: { delegatorPkpInfo } }
  ) => {
    const { ethAddress } = delegatorPkpInfo;

    console.log(`[${PKG}/commit] 🚀 POLICY COMMIT CALLED`);
    console.log(`[${PKG}/commit] Committing Polymarket policy`, {
      eventId,
      endDate,
      volume1yr,
      daysUntilEnd,
      ethAddress,
      appId,
    });

    try {
      // In the commit phase, we've already validated everything
      // Just log the successful validation and return success
      const successMessage = `Polymarket bet validated successfully for event ${eventId}. ` +
        `Volume: $${volume1yr.toLocaleString()}, Days until end: ${daysUntilEnd}`;

      console.log(
        `[${PKG}/commit] ✅ ${successMessage}`
      );

      return allow({
        success: true,
        eventId,
        message: successMessage,
      });
    } catch (error) {
      console.error(`[${PKG}/commit] Error in commit phase:`, error);

      // Even if there's an error in commit, we typically allow since validation passed
      return allow({
        success: false,
        eventId,
        message: `Commit completed with warning: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  },
});
