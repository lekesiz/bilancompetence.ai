/**
 * CSRF Token Helper for Frontend
 * 🔒 SECURITY: Reads CSRF token from cookie and includes it in requests
 */

/**
 * Get CSRF token from cookie
 */
export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrf_token') {
      return decodeURIComponent(value);
    }
  }

  return null;
}

/**
 * Get headers with CSRF token for mutating requests
 */
export function getHeadersWithCsrf(additionalHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    ...additionalHeaders,
  };

  const csrfToken = getCsrfToken();
  if (csrfToken) {
    headers['x-csrf-token'] = csrfToken;
  }

  return headers;
}
