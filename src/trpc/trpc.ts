import { initTRPC } from "@trpc/server";

const t = initTRPC.context().create(); // Initializes tRPC and creates a router and procedures.
export const router = t.router;
export const publicProcedure = t.procedure; // For endpoints that can be accessed publicly.to call
