import { appRouter } from "@/trpc";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

// Defines the API endpoint for tRPC at /api/trpc. This is where the tRPC server will listen for incoming requests.

// When you make a request to /api/trpc, the fetchRequestHandler in route.ts takes the incoming request and routes it to the appropriate procedure defined in appRouter. In this case, if you call anyApiRoute, it will respond with the string "Hello".

const handler = (req: Request) => {
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({}),
  });
};

export { handler as GET, handler as POST };
