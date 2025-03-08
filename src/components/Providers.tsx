"use client";

import { PropsWithChildren, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc } from "@/trpc/client";
import { httpBatchLink } from "@trpc/client";

// Allows us to use tRPC throughout the entire frontend
const Providers = ({
  children,
}: PropsWithChildren) /* It's the same as {children: ReactNode} */ => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/trpc`, // The URL where the backend(index.ts) will be called later
          fetch(url, options) {
            return fetch(url, { ...options, credentials: "include" }); // The cookie will be passed as well
          },
        }), // Lets us batch requests together for maxium performace
      ],
    })
  );
  return (
    // This component wraps the application in the tRPC provider, allowing the use of tRPC hooks throughout the app.
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      {/* This doesn't have anything to do with trpc, but to use tanstack react query completely independent of trpc if we wanted to */}
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
    /* So again, trpc is just a very thin type safe wrapper around react query that we could also use as standalone library*/
  );
};

export default Providers;
