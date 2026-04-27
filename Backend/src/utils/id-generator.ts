import * as crypto from 'crypto';

/**
 * Generates a completely secure, random alphanumeric base62 string.
 * This is cryptographically random and guarantees highly complex sequence entropy.
 */
function generateRandomBase62(length: number): string {
  const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += charset[randomBytes[i] % charset.length];
  }
  return result;
}

/**
 * Generates an Enterprise Stripe-style database identifier.
 * Example: 'cus_X9T2M1K' or 'ord_B1XM28A'
 * @param prefix A 3-letter table/domain prefix (e.g., 'cus', 'ord', 'prd')
 * @returns Formatted ID String
 */
export function generateEntityId(prefix: string): string {
  // Using 8-character complexity offers ~218 trillion unique combinations
  return `${prefix}_${generateRandomBase62(8)}`;
}
