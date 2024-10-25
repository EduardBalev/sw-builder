import { toCapitalizedString } from "./string";

/**
 * Retrieves the value of a specific header from a given request.
 *
 * @param {Request} request - The request object containing headers.
 * @param {string} headerName - The name of the header to retrieve.
 * @returns {string | null} The value of the specified header, or null if the header is not found.
 */
export function getRequestHeader(
  request: Request,
  headerName: string,
): string | null {
  return request?.headers?.get(toCapitalizedString(headerName));
}
