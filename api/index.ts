import { Hono } from "hono";
import { testController } from "@/api/controllers/test.controller";
import { userController } from "@/api/controllers/user.controller";

const app = new Hono<{ Bindings: Env }>();

// Test route
app.get("/api/test", testController.getTestData);

// User routes
app.post("/api/users", userController.createUser);

// Health check
app.get("/api/health", (c) => c.json({ status: "ok", service: "ATLAS API" }));

export default app;
