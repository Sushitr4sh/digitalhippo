import { initTRPC } from "@trpc/server";

const t = initTRPC.context().create();
export const router = t.router;
export const publicProcedure = t.procedure; //For endpoint that everybod should be able to call
