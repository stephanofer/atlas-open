import type { Session, User } from "@supabase/supabase-js";
import type { Profile } from "./database";

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;
}

export interface AuthActions {
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (data: SignUpData) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  setProfile: (profile: Profile | null) => void;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
}

export type AuthStore = AuthState & AuthActions;
