// Helper function to check if a URL matches any string or RegExp pattern
export function matchesPattern(
  url: string,
  patterns: (string | RegExp)[],
): boolean {
  return patterns.some((pattern) => {
    if (typeof pattern === "string") {
      return url.includes(pattern); // If the pattern is a string, check if the URL contains it
    } else {
      return pattern.test(url); // If it's a RegExp, use the test method
    }
  });
}

/**
 * Converts any case string to a pattern where only the first letter of the entire string is capitalized
 * and the rest of the string is in lowercase.
 *
 * @param {string} input - The input string to be converted.
 * @returns {string} The formatted string where only the first letter is capitalized.
 */
export function toCapitalizedString(input: string): string {
  return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
}
