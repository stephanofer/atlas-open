import { Hono } from "hono";
import { testController } from "@/api/controllers/test.controller";

const app = new Hono<{ Bindings: Env }>();

// Test route
app.get("/api/test", testController.getTestData);

// Health check
app.get("/api/health", (c) => c.json({ status: "ok", service: "ATLAS API" }));

export default app;
