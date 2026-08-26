import { useAuthStore, type StaffSession } from '../store/auth';
import { validateEmail, validateRequired } from './validation';

/**
 * Staff authentication service. Thin wrapper over the persisted auth store
 * that adds input validation and a reusable guard for staff-only operations.
 */

export type AuthResult =
  | { ok: true; session: StaffSession }
  | { ok: false; error: string };

/** Current staff session, or null when nobody is signed in. */
export function getStaffSession(): StaffSession | null {
  return useAuthStore.getState().staff;
}

/** True when an active staff session exists. */
export function isStaffSessionActive(): boolean {
  return useAuthStore.getState().staff !== null;
}

/**
 * Role guard for staff operations. Rejects when no staff session is active,
 * so guest (unauthenticated) callers can never reach staff data.
 */
export function requireStaff():
  | { ok: true; session: StaffSession }
  | { ok: false; error: string } {
  const session = useAuthStore.getState().staff;
  if (!session) {
    return { ok: false, error: 'Staff sign-in required. Please sign in to continue.' };
  }
  return { ok: true, session };
}

/** Validates credentials and opens a staff session on success. */
export function staffLogin(email: string, password: string): AuthResult {
  const emailError = validateEmail(email);
  if (emailError) return { ok: false, error: emailError };
  const passwordError = validateRequired(password, 'Password');
  if (passwordError) return { ok: false, error: passwordError };

  const ok = useAuthStore.getState().staffLogin(email, password);
  if (!ok) return { ok: false, error: 'Invalid email or password.' };
  const session = useAuthStore.getState().staff;
  if (!session) return { ok: false, error: 'Could not start a staff session.' };
  return { ok: true, session };
}

/** Ends the active staff session. */
export function staffLogout(): void {
  useAuthStore.getState().staffLogout();
}
