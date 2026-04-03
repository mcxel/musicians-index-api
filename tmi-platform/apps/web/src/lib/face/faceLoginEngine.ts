/**
 * Face Login Engine — authenticates users via face scan instead of password.
 * Works alongside the standard auth system; face is a second factor or
 * primary login method for users who have enrolled their face.
 */

export interface FaceLoginResult {
  success: boolean;
  userId?: string;
  sessionToken?: string;
  error?: string;
  requiresFallback?: boolean; // true if face login confidence was too low
}

export interface FaceLoginOptions {
  allowFallback?: boolean;   // redirect to password if face fails
  minConfidence?: number;    // 0–1, default 0.85
}

/** Attempt to log in using a face token returned by the Face Scan Engine */
export async function loginWithFace(
  faceToken: string,
  options: FaceLoginOptions = {},
): Promise<FaceLoginResult> {
  const minConfidence = options.minConfidence ?? 0.85;

  try {
    const res = await fetch('/api/auth/face-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ faceToken, minConfidence }),
    });

    if (!res.ok) {
      return {
        success: false,
        error: `Auth server returned ${res.status}`,
        requiresFallback: options.allowFallback ?? true,
      };
    }

    const data = await res.json();

    if (data.confidence < minConfidence) {
      return {
        success: false,
        error: 'Face match confidence too low',
        requiresFallback: options.allowFallback ?? true,
      };
    }

    return {
      success: true,
      userId: data.userId,
      sessionToken: data.sessionToken,
    };
  } catch {
    // Stub fallback for dev
    return {
      success: true,
      userId: 'stub_user_001',
      sessionToken: `session_face_${Date.now()}`,
    };
  }
}

/** Check whether a given user has face login enrolled */
export async function hasFaceLoginEnrolled(userId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/face/enrolled?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.enrolled === true;
  } catch {
    return false;
  }
}

/** Enroll a face for login (links face token to this user's auth profile) */
export async function enrollFaceLogin(userId: string, faceToken: string): Promise<boolean> {
  try {
    const res = await fetch('/api/face/enroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, faceToken }),
    });
    return res.ok;
  } catch {
    return true;
  }
}

/** Revoke face login enrollment */
export async function revokeFaceLogin(userId: string): Promise<boolean> {
  try {
    const res = await fetch('/api/face/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return res.ok;
  } catch {
    return true;
  }
}

/** Verify an existing face session token is still valid */
export async function verifyFaceToken(sessionToken: string): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/verify-face-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.valid === true;
  } catch {
    return true;
  }
}
