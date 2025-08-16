/**
 * Helper functions for the Polymarket policy
 * Validates event IDs, end dates, and volume requirements
 */

// Default allowed event IDs
export const DEFAULT_ALLOWED_EVENT_IDS = [
  "37966",
  "16108",
  "17105",
  "24087",
  "23635",
  "37055",
  "37947",
  "37179",
  "27830",
  "30367",
];

/**
 * Validate if an event ID is in the allowed list
 */
export function validateEventId(
  eventId: string,
  allowedEventIds?: string[]
): boolean {
  const allowedList = allowedEventIds || DEFAULT_ALLOWED_EVENT_IDS;
  return allowedList.includes(eventId);
}

/**
 * Validate if the end date is within the specified number of days from now
 */
export function validateEndDate(
  endDate: string,
  maxDaysUntilEnd: number
): { valid: boolean; daysUntilEnd: number } {
  const now = new Date();
  const end = new Date(endDate);
  
  // Calculate days until end
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const daysUntilEnd = Math.ceil((end.getTime() - now.getTime()) / millisecondsPerDay);
  
  return {
    valid: daysUntilEnd > 0 && daysUntilEnd <= maxDaysUntilEnd,
    daysUntilEnd,
  };
}

/**
 * Validate if the volume meets the minimum requirement
 */
export function validateVolume(
  volume1yr: number,
  minVolume: number
): boolean {
  return volume1yr >= minVolume;
}

/**
 * Get a human-readable reason for why validation failed
 */
export function getValidationFailureReason(
  failedCheck: 'eventId' | 'endDate' | 'volume',
  actual: string | number,
  required: string | number | string[]
): string {
  switch (failedCheck) {
    case 'eventId':
      return `Event ID ${actual} is not in the allowed list. Allowed IDs: ${Array.isArray(required) ? required.join(', ') : required}`;
    case 'endDate':
      return `Event end date is ${actual} days away. Maximum allowed is ${required} days.`;
    case 'volume':
      return `Market volume of $${actual} is below the minimum required volume of $${required}`;
    default:
      return `Validation failed for ${failedCheck}`;
  }
}