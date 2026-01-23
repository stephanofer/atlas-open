import { create } from "zustand";
import { supabase } from "@/ui/lib/supabase";
import { queryClient } from "@/ui/lib/query-client";
import type { AuthStore, SignUpData } from "@/ui/types/auth";
import type { Profile } from "@/ui/types/database";

// Module-level cleanup reference for auth subscription
let authSubscription: { unsubscribe: () => void } | null = null;

export const useAuthStore = create<AuthStore>((set, get) => ({
  // State
  user: null,
  session: null,
  profile: null,
  isLoading: false,
  isInitialized: false,

  // Initialize auth - called once on app mount
  initialize: async () => {
    const state = get();

    // Prevent double initialization (React Strict Mode safety)
    if (state.isInitialized || state.isLoading) {
      return;
    }

    set({ isLoading: true });

    try {
      // Get current session from Supabase
      const {
        data: { session },
      } = await supabase.auth.getSession();

      let profile: Profile | null = null;

      if (session?.user) {
        // Fetch user profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        profile = profileData as Profile | null;
      }

      // Set initial state - ALWAYS set isInitialized to true
      set({
        user: session?.user ?? null,
        session: session ?? null,
        profile,
        isLoading: false,
        isInitialized: true,
      });

      // Clean up previous subscription
      if (authSubscription) {
        authSubscription.unsubscribe();
        authSubscription = null;
      }

      // Listen for auth state changes
      const { data } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (event === "SIGNED_IN" && newSession?.user) {
          const { data: newProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", newSession.user.id)
            .maybeSingle();

          set({
            user: newSession.user,
            session: newSession,
            profile: newProfile as Profile | null,
          });
        } else if (event === "SIGNED_OUT") {
          queryClient.clear();
          set({
            user: null,
            session: null,
            profile: null,
          });
        } else if (event === "TOKEN_REFRESHED" && newSession) {
          set({ session: newSession });
        } else if (event === "USER_UPDATED" && newSession) {
          set({ user: newSession.user, session: newSession });
        }
      });

      authSubscription = data.subscription;
    } catch (error) {
      console.error("[Auth] Initialization error:", error);
      // CRITICAL: Always complete initialization even on error
      set({
        user: null,
        session: null,
        profile: null,
        isLoading: false,
        isInitialized: true,
      });
    }
  },

  signIn: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: "Credenciales incorrectas. Verificá tu email y contraseña." };
    }

    // Auth listener will update state automatically
    return { error: null };
  },

  signUp: async (data: SignUpData) => {
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            company_name: data.companyName,
          },
        },
      });

      if (authError || !authData.user) {
        if (authError?.message?.includes("already registered")) {
          return { error: "Este email ya está registrado." };
        }
        return { error: authError?.message || "Error al crear la cuenta." };
      }

      // 2. Call RPC to create company, profile, and default categories
      const { data: result, error: rpcError } = await supabase.rpc("register_new_account", {
        p_user_id: authData.user.id,
        p_email: data.email,
        p_full_name: data.fullName,
        p_company_name: data.companyName,
      });

      if (rpcError || !result?.success) {
        return { error: "Error al crear la empresa. Intentá de nuevo." };
      }

      // 3. Fetch the newly created profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (profile) {
        set({
          user: authData.user,
          session: authData.session,
          profile: profile as Profile,
        });
      }

      return { error: null };
    } catch {
      return { error: "Error inesperado. Intentá de nuevo." };
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    set({
      user: null,
      session: null,
      profile: null,
    });
  },

  setProfile: (profile: Profile | null) => {
    set({ profile });
  },
}));

// Cleanup on window unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    if (authSubscription) {
      authSubscription.unsubscribe();
    }
  });
}
