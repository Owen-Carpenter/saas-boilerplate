import crypto from 'crypto';

/**
 * Generate a consistent UUID v5 from an email
 * This ensures that even with different auth providers, the same email always maps to the same user ID
 */
export function generateUuidFromEmail(email: string): string {
  // Use a consistent namespace UUID (this is just a random UUID, you can keep it the same)
  const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
  
  // Take first 16 bytes of hash (128 bits)
  const hash = crypto.createHash('md5').update(NAMESPACE + email).digest('hex');
  
  // Format as UUID v4 (random) style UUID
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    // Version 4 UUID has specific bits set
    '4' + hash.substring(13, 16),
    // Variant bits are set to '10xx' for standard UUIDs
    '8' + hash.substring(17, 20),
    hash.substring(20, 32)
  ].join('-');
} 