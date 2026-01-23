import type { Context } from "hono";
import { createUserSchema } from "@/api/schemas/user.schema";
import { createUser } from "@/api/services/user.service";

export const userController = {
  /**
   * Create a new user (admin only)
   * Uses Supabase Admin API to create user without affecting the current session
   */
  createUser: async (c: Context<{ Bindings: Env }>) => {
    try {
      // Parse and validate request body
      const body = await c.req.json();
      const parseResult = createUserSchema.safeParse(body);

      if (!parseResult.success) {
        return c.json(
          {
            success: false,
            error: "Datos inválidos",
            details: parseResult.error.issues,
          },
          400
        );
      }

      // Create user using service
      const result = await createUser(parseResult.data, c.env);

      if (!result.success) {
        return c.json(
          { success: false, error: result.error },
          400
        );
      }

      return c.json(
        { success: true, user: result.user },
        201
      );
    } catch (error) {
      console.error("Create user error:", error);
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Error interno del servidor",
        },
        500
      );
    }
  },
};
