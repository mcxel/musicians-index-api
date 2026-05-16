/**
 * authUtils.ts
 *
 * Client-side utilities for CSRF token management and authenticated API calls.
 * Every state-changing API call should use these utilities.
 */

/**
 * Get CSRF token from response header or cookie.
 */
export function getCSRFToken(): string {
  // Try to get from meta tag (if set in HTML)
  const metaTag = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
  if (metaTag?.content) {
    return metaTag.content;
  }

  // Try to get from localStorage (set by middleware response header)
  const stored = localStorage.getItem('_csrf_token');
  if (stored) {
    return stored;
  }

  return '';
}

/**
 * Store CSRF token (called when middleware sends X-CSRF-Token header).
 */
export function storeCSRFToken(token: string): void {
  localStorage.setItem('_csrf_token', token);
  // Also update meta tag if it exists
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  if (metaTag) {
    metaTag.setAttribute('content', token);
  }
}

/**
 * Make authenticated API call with CSRF protection.
 * Automatically includes CSRF token in headers.
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const method = options.method || 'GET';
  const headers = new Headers(options.headers || {});

  // Add CSRF token for state-changing operations
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      headers.set('X-CSRF-Token', csrfToken);
    }
  }

  // Ensure credentials included (for httpOnly cookies)
  if (!('credentials' in options)) {
    options.credentials = 'include';
  }

  const response = await fetch(url, { ...options, headers, method });

  // Extract CSRF token from response headers if provided
  const newCSRFToken = response.headers.get('X-CSRF-Token');
  if (newCSRFToken) {
    storeCSRFToken(newCSRFToken);
  }

  return response;
}

/**
 * POST with CSRF protection.
 */
export async function authenticatedPost<T = any>(
  url: string,
  data: Record<string, any> = {}
): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const response = await authenticatedFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      return {
        ok: false,
        error: errorData.error || `HTTP ${response.status}`,
      };
    }

    const result = await response.json().catch(() => ({}));
    return { ok: true, data: result as T };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * GET with CSRF token refresh.
 */
export async function authenticatedGet<T = any>(url: string): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const response = await authenticatedFetch(url, { method: 'GET' });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      return {
        ok: false,
        error: errorData.error || `HTTP ${response.status}`,
      };
    }

    const result = await response.json().catch(() => ({}));
    return { ok: true, data: result as T };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handle 401/403 responses (session expired or forbidden).
 */
export function handleAuthError(error: string, redirectToLogin = true): void {
  console.error('[Auth] Error:', error);

  if (error.includes('Unauthorized') || error.includes('session')) {
    localStorage.removeItem('_csrf_token');
    if (redirectToLogin) {
      window.location.href = `/auth/signin?error=${encodeURIComponent(error)}`;
    }
  }

  if (error.includes('Forbidden')) {
    window.location.href = '/auth/signin?error=unauthorized';
  }

  if (error.includes('CSRF')) {
    // Refresh page to get new CSRF token
    window.location.reload();
  }
}

/**
 * Check if session is still valid by making a lightweight API call.
 */
export async function validateSession(): Promise<boolean> {
  try {
    const response = await authenticatedFetch('/api/auth/session');
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Logout and clear CSRF token.
 */
export async function logout(): Promise<void> {
  localStorage.removeItem('_csrf_token');
  await authenticatedPost('/api/auth/logout');
  window.location.href = '/auth/signin';
}
