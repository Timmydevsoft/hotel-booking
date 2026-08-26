import { create } from 'zustand';
import { DEMO_STAFF, DEMO_STAFF_PASSWORD } from '../data/seed';

export interface StaffSession {
  name: string;
  email: string;
}

const AUTH_KEY = 'evergreen-staff-session';

function getInitialStaff(): StaffSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as StaffSession) : null;
  } catch {
    return null;
  }
}

interface AuthState {
  staff: StaffSession | null;
  staffLogin: (email: string, password: string) => boolean;
  staffLogout: () => void;
}

/**
 * Demo staff session backed by the seed data's single staff account.
 * The real credential check ships with the staff dashboard phase; for now
 * this accepts the documented demo account only.
 */
export const useAuthStore = create<AuthState>((set) => ({
  staff: getInitialStaff(),
  staffLogin: (email, password) => {
    const valid =
      email.trim().toLowerCase() === DEMO_STAFF.email && password === DEMO_STAFF_PASSWORD;
    if (!valid) return false;
    const session: StaffSession = { name: DEMO_STAFF.name, email: DEMO_STAFF.email };
    window.localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    set({ staff: session });
    return true;
  },
  staffLogout: () => {
    window.localStorage.removeItem(AUTH_KEY);
    set({ staff: null });
  },
}));
