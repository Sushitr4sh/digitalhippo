import { authRouter } from "./auth-router";
import { publicProcedure, router } from "./trpc";

// This file defines the application router using the procedures created in trpc.ts
// We don't need to put all the API logic/procedure inside this file

export const appRouter = router({
  auth: authRouter,
});

export type AppRouter = typeof appRouter; // Represents the entire API structure.
