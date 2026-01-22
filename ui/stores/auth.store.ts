import { create } from "zustand";
import { supabase } from "@/ui/lib/supabase";
import { queryClient } from "@/ui/lib/query-client";
import type { AuthStore, SignUpData } from "@/ui/types/auth";
import type { Profile } from "@/ui/types/database";

let authSubscription: { unsubscribe: () => void } | null = null;
let isInitializing = false;

export const useAuthStore = create<AuthStore>((set, get) => ({
  // State
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isInitialized: false,

  // Actions
  initialize: async () => {
    // Prevent double initialization (React Strict Mode)
    if (get().isInitialized || isInitializing) return;
    isInitializing = true;

    try {
      // Get initial session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // Fetch profile with maybeSingle to avoid PGRST116 error when profile doesn't exist yet
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profileError) {
          console.warn("Profile fetch error:", profileError);
        }

        set({
          user: session.user,
          session,
          profile: profile as Profile | null,
          isLoading: false,
          isInitialized: true,
        });
      } else {
        set({
          user: null,
          session: null,
          profile: null,
          isLoading: false,
          isInitialized: true,
        });
      }

      // Clean up previous subscription
      if (authSubscription) {
        authSubscription.unsubscribe();
      }

      // Subscribe to auth changes
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          // Use maybeSingle to avoid PGRST116 error
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle();

          if (profileError) {
            console.warn("Profile fetch error on auth change:", profileError);
          }

          set({
            user: session.user,
            session,
            profile: profile as Profile | null,
            isLoading: false,
          });
        } else if (event === "SIGNED_OUT") {
          queryClient.clear(); // Clear cache on logout
          set({
            user: null,
            session: null,
            profile: null,
            isLoading: false,
          });
        } else if (event === "TOKEN_REFRESHED" && session) {
          set({ session });
        }
      });

      authSubscription = data.subscription;
    } catch (error) {
      console.error("Auth initialization error:", error);
      set({
        user: null,
        session: null,
        profile: null,
        isLoading: false,
        isInitialized: true,
      });
    } finally {
      isInitializing = false;
    }
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true });

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      set({ isLoading: false });
      return { error: "Credenciales incorrectas. Verificá tu email y contraseña." };
    }

    return { error: null };
  },

  signUp: async (data: SignUpData) => {
    set({ isLoading: true });

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
        set({ isLoading: false });
        
        if (authError?.message?.includes("already registered")) {
          return { error: "Este email ya está registrado." };
        }
        
        return { error: authError?.message || "Error al crear la cuenta." };
      }

      // 2. Call RPC to create company, profile, and default categories
      // This bypasses RLS using SECURITY DEFINER
      const { data: result, error: rpcError } = await supabase.rpc("register_new_account", {
        p_user_id: authData.user.id,
        p_email: data.email,
        p_full_name: data.fullName,
        p_company_name: data.companyName,
      });

      if (rpcError || !result?.success) {
        set({ isLoading: false });
        console.error("Registration RPC error:", rpcError);
        return { error: "Error al crear la empresa. Intentá de nuevo." };
      }

      // 3. Fetch the newly created profile and update state
      // This is necessary because the auth listener fires before the RPC completes
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
          isLoading: false,
        });
      }

      return { error: null };
    } catch (error) {
      set({ isLoading: false });
      console.error("SignUp error:", error);
      return { error: "Error inesperado. Intentá de nuevo." };
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    await supabase.auth.signOut();
    queryClient.clear(); // Clear all cached data
    set({
      user: null,
      session: null,
      profile: null,
      isLoading: false,
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
