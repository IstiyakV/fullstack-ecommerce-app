// A simple reversible obfuscation for numeric IDs to make them look like large random integers in URLs.
const PRIME = 997;
const OFFSET = 184626000;

export function encodeId(realId) {
  if (!realId) return '';
  const idNum = parseInt(realId, 10);
  if (isNaN(idNum) || idNum <= 0) return realId; // Fallback
  return ((idNum * PRIME) + OFFSET).toString();
}

export function decodeId(encodedId) {
  if (!encodedId) return '';
  const encNum = parseInt(encodedId, 10);
  if (isNaN(encNum)) return encodedId; // Fallback
  const decoded = (encNum - OFFSET) / PRIME;
  if (Number.isInteger(decoded) && decoded > 0) {
    return decoded.toString();
  }
  return encodedId; // Fallback to raw string if it wasn't mathematically encoded properly
}
