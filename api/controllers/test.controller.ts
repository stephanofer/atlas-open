import type { Context } from "hono";
import { testService } from "@/api/services/test.service";

export const testController = {
  getTestData: (c: Context) => {
    const data = testService.getTestData();
    return c.json(data);
  },
};
