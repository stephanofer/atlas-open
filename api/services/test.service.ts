import type { TestData } from "@/api/schemas/test.schema";

export const testService = {
  getTestData: (): TestData => {
    return {
      message: "Hello from ATLAS API!",
      timestamp: new Date().toISOString(),
      status: "success",
    };
  },
};
