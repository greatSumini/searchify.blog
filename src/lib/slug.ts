/**
 * Generates a URL-friendly slug from a given string
 * Handles both Korean and English text
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    // Replace Korean characters with romanization (basic approach)
    .replace(/[\u3131-\uD79D]/g, '') // Remove Korean characters for now
    // Replace spaces and special characters with hyphens
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Generates a unique slug by appending a random string
 */
export const generateUniqueSlug = (text: string): string => {
  const baseSlug = generateSlug(text);
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${randomSuffix}`;
};
