import { create } from "zustand";
import { supabase } from "@/ui/lib/supabase";
import { queryClient } from "@/ui/lib/query-client";
import { debugAuth, sessionTracker } from "@/ui/lib/debug";
import type { AuthStore, SignUpData } from "@/ui/types/auth";
import type { Profile } from "@/ui/types/database";

let authSubscription: { unsubscribe: () => void } | null = null;
let isInitializing = false;

// Session refresh interval (check every 5 minutes)
let sessionCheckInterval: ReturnType<typeof setInterval> | null = null;
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

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
    if (get().isInitialized || isInitializing) {
      debugAuth.log("Initialize skipped - already initialized or in progress");
      return;
    }
    isInitializing = true;
    sessionTracker.log("initialize:start");

    const timer = debugAuth.time("Initialize auth");

    try {
      // Get initial session
      debugAuth.log("Getting initial session...");
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        debugAuth.error("Session fetch error", sessionError);
        sessionTracker.log("initialize:session-error", sessionError);
      }

      if (session?.user) {
        debugAuth.success("Session found", { userId: session.user.id, expiresAt: session.expires_at });
        sessionTracker.log("initialize:session-found", { userId: session.user.id });

        // Fetch profile with maybeSingle to avoid PGRST116 error when profile doesn't exist yet
        debugAuth.log("Fetching user profile...");
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profileError) {
          debugAuth.warn("Profile fetch error", profileError);
          sessionTracker.log("initialize:profile-error", profileError);
        } else {
          debugAuth.success("Profile loaded", { role: profile?.role, companyId: profile?.company_id });
        }

        set({
          user: session.user,
          session,
          profile: profile as Profile | null,
          isLoading: false,
          isInitialized: true,
        });
      } else {
        debugAuth.log("No active session found");
        sessionTracker.log("initialize:no-session");
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
        debugAuth.log("Cleaning up previous auth subscription");
        authSubscription.unsubscribe();
        authSubscription = null;
      }

      // Clear previous session check interval
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
        sessionCheckInterval = null;
      }

      // Subscribe to auth changes
      debugAuth.log("Setting up auth state listener");
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        debugAuth.log(`Auth event: ${event}`, { 
          hasSession: !!session, 
          userId: session?.user?.id,
          expiresAt: session?.expires_at 
        });
        sessionTracker.log(`auth:${event}`, { userId: session?.user?.id });

        if (event === "SIGNED_IN" && session?.user) {
          debugAuth.log("User signed in, fetching profile...");
          // Use maybeSingle to avoid PGRST116 error
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle();

          if (profileError) {
            debugAuth.warn("Profile fetch error on sign in", profileError);
          } else {
            debugAuth.success("Profile loaded on sign in", { role: profile?.role });
          }

          set({
            user: session.user,
            session,
            profile: profile as Profile | null,
            isLoading: false,
          });
        } else if (event === "SIGNED_OUT") {
          debugAuth.log("User signed out, clearing state and cache");
          sessionTracker.log("auth:signed-out-cleanup");
          queryClient.clear(); // Clear cache on logout
          set({
            user: null,
            session: null,
            profile: null,
            isLoading: false,
          });
        } else if (event === "TOKEN_REFRESHED" && session) {
          debugAuth.success("Token refreshed", { expiresAt: session.expires_at });
          sessionTracker.log("auth:token-refreshed", { expiresAt: session.expires_at });
          set({ session });
        } else if (event === "USER_UPDATED" && session) {
          debugAuth.log("User updated", { userId: session.user.id });
          set({ user: session.user, session });
        }
      });

      authSubscription = data.subscription;

      // Set up periodic session check to catch expired sessions
      sessionCheckInterval = setInterval(async () => {
        const currentSession = get().session;
        if (!currentSession) return;

        const expiresAt = currentSession.expires_at;
        if (!expiresAt) return;

        const now = Math.floor(Date.now() / 1000);
        const expiresIn = expiresAt - now;

        debugAuth.log(`Session check: expires in ${Math.floor(expiresIn / 60)} minutes`);

        // If session expires in less than 2 minutes, try to refresh
        if (expiresIn < 120) {
          debugAuth.warn("Session expiring soon, attempting refresh...");
          sessionTracker.log("session:refresh-needed", { expiresIn });
          
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            debugAuth.error("Session refresh failed", refreshError);
            sessionTracker.log("session:refresh-failed", refreshError);
            // Session is invalid, sign out
            get().signOut();
          } else if (refreshData.session) {
            debugAuth.success("Session refreshed proactively");
            sessionTracker.log("session:refresh-success");
            set({ session: refreshData.session });
          }
        }
      }, SESSION_CHECK_INTERVAL);

    } catch (error) {
      debugAuth.error("Auth initialization error", error);
      sessionTracker.log("initialize:error", error);
      set({
        user: null,
        session: null,
        profile: null,
        isLoading: false,
        isInitialized: true,
      });
    } finally {
      isInitializing = false;
      timer.end();
    }
  },

  signIn: async (email: string, password: string) => {
    debugAuth.log("Sign in attempt", { email });
    sessionTracker.log("signin:start", { email });
    set({ isLoading: true });

    const timer = debugAuth.time("Sign in");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    timer.end();

    if (error) {
      debugAuth.error("Sign in failed", error);
      sessionTracker.log("signin:failed", { error: error.message });
      set({ isLoading: false });
      return { error: "Credenciales incorrectas. Verificá tu email y contraseña." };
    }

    debugAuth.success("Sign in successful");
    sessionTracker.log("signin:success", { email });
    return { error: null };
  },

  signUp: async (data: SignUpData) => {
    debugAuth.log("Sign up attempt", { email: data.email, company: data.companyName });
    sessionTracker.log("signup:start", { email: data.email });
    set({ isLoading: true });

    const timer = debugAuth.time("Sign up");

    try {
      // 1. Create auth user
      debugAuth.log("Creating auth user...");
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
        debugAuth.error("Auth user creation failed", authError);
        set({ isLoading: false });
        
        if (authError?.message?.includes("already registered")) {
          return { error: "Este email ya está registrado." };
        }
        
        return { error: authError?.message || "Error al crear la cuenta." };
      }

      debugAuth.success("Auth user created", { userId: authData.user.id });

      // 2. Call RPC to create company, profile, and default categories
      // This bypasses RLS using SECURITY DEFINER
      debugAuth.log("Calling registration RPC...");
      const { data: result, error: rpcError } = await supabase.rpc("register_new_account", {
        p_user_id: authData.user.id,
        p_email: data.email,
        p_full_name: data.fullName,
        p_company_name: data.companyName,
      });

      if (rpcError || !result?.success) {
        debugAuth.error("Registration RPC failed", rpcError);
        set({ isLoading: false });
        return { error: "Error al crear la empresa. Intentá de nuevo." };
      }

      debugAuth.success("Registration RPC completed", result);

      // 3. Fetch the newly created profile and update state
      // This is necessary because the auth listener fires before the RPC completes
      debugAuth.log("Fetching new profile...");
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (profile) {
        debugAuth.success("New profile loaded", { role: profile.role });
        set({
          user: authData.user,
          session: authData.session,
          profile: profile as Profile,
          isLoading: false,
        });
      }

      timer.end();
      sessionTracker.log("signup:success", { userId: authData.user.id });
      return { error: null };
    } catch (error) {
      timer.end();
      debugAuth.error("Sign up error", error);
      sessionTracker.log("signup:error", error);
      set({ isLoading: false });
      return { error: "Error inesperado. Intentá de nuevo." };
    }
  },

  signOut: async () => {
    debugAuth.log("Sign out initiated");
    sessionTracker.log("signout:start");
    set({ isLoading: true });

    // Clear session check interval
    if (sessionCheckInterval) {
      clearInterval(sessionCheckInterval);
      sessionCheckInterval = null;
    }

    await supabase.auth.signOut();
    queryClient.clear(); // Clear all cached data
    
    debugAuth.success("Sign out completed, cache cleared");
    sessionTracker.log("signout:complete");
    
    set({
      user: null,
      session: null,
      profile: null,
      isLoading: false,
    });
  },

  setProfile: (profile: Profile | null) => {
    debugAuth.log("Profile updated", { role: profile?.role });
    set({ profile });
  },
}));

// Cleanup on window unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    debugAuth.log("Window unloading, cleaning up...");
    if (authSubscription) {
      authSubscription.unsubscribe();
    }
    if (sessionCheckInterval) {
      clearInterval(sessionCheckInterval);
    }
  });
}
