import { createClient } from "@supabase/supabase-js";
import type { CreateUserInput } from "@/api/schemas/user.schema";

export interface CreateUserResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    full_name: string;
    role: string;
  };
  error?: string;
}

export async function createUser(
  input: CreateUserInput,
  env: Env
): Promise<CreateUserResult> {
  // Create Supabase admin client with service_role key
  // This allows creating users without triggering session changes on the client
  const supabaseAdmin = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  // 1. Create auth user using Admin API
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: input.full_name,
      },
    });

  if (authError) {
    console.error("Auth creation error:", authError);
    
    if (authError.message?.includes("already been registered")) {
      return { success: false, error: "Este email ya está registrado" };
    }
    
    return { success: false, error: authError.message || "Error al crear el usuario" };
  }

  if (!authData.user) {
    return { success: false, error: "Error al crear el usuario de autenticación" };
  }

  // 2. Create profile record
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .insert({
      id: authData.user.id,
      company_id: input.company_id,
      email: input.email,
      full_name: input.full_name,
      role: input.role,
      position: input.position || null,
      area_id: input.area_id || null,
      status: "active",
    })
    .select("id, email, full_name, role")
    .single();

  if (profileError) {
    console.error("Profile creation error:", profileError);
    
    // Try to clean up the auth user if profile creation fails
    try {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    } catch (cleanupError) {
      console.error("Failed to cleanup auth user:", cleanupError);
    }
    
    return { success: false, error: "Error al crear el perfil del usuario" };
  }

  return {
    success: true,
    user: {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
    },
  };
}
