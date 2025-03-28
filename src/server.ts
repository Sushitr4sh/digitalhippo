import express from "express";
import { getPayloadClient } from "./get-payload";
import { nextApp, nextHandler } from "./next-utils";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./trpc";
import { inferAsyncReturnType } from "@trpc/server";
import bodyParser from "body-parser";
import { IncomingMessage } from "http";
import { stripeWebhookHandler } from "./webhooks";
import nextBuild from "next/dist/build";
import path from "path";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({
  req,
  res,
});

export type ExpressContext = inferAsyncReturnType<typeof createContext>;

// Check if the message actually comes from stripe
export type WebhookRequest = IncomingMessage & { rawBody: Buffer }; // & is for extend

const start = async () => {
  // bodyParser is a package that we install that goes well with express and allow us to receive the proper notification from stripe. We want to modify the message that strip sends.
  const webhookMiddleware = bodyParser.json({
    verify: (req: WebhookRequest, _, buffer) => {
      req.rawBody = buffer;
    },
  });

  // We're going to configure this in the stripe dashboard, use the webhookMiddleware first so we can have access to req.rawBody
  app.post(
    "/api/webhooks/stripe",
    webhookMiddleware,
    stripeWebhookHandler as express.RequestHandler
  );

  const payload = await getPayloadClient({
    initOptions: {
      express: app,
      onInit: async (cms) => {
        cms.logger.info(`Admin URL: ${cms.getAdminURL()}`);
      },
    },
  });

  /* What happened when next.js is building */
  if (process.env.NEXT_BUILD) {
    app.listen(PORT, async () => {
      payload.logger.info("Next.js is building for production");

      // @ts-expect-error
      await nextBuild(path.join(__dirname, "../"));

      process.exit();
    });

    return;
  }

  // When we get a request in our server (because we're self hosting) we will get it here. We can simply forward that to trpc in nextjs to handle it appropriately
  app.use(
    "/api/trpc",
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext, // Take req and res from express then attach it to a context to be able to use it in next.js
    })
  );
  // When we get a request to this endpoint, we want to forward it to trpc in next.js

  app.use((req, res) => nextHandler(req, res));

  nextApp.prepare().then(() => {
    payload.logger.info("Next.js started");

    app.listen(PORT, async () => {
      payload.logger.info(
        `Next.js App URL: ${process.env.NEXT_PUBLIC_SERVER_URL}`
      );
    });
  });
};

start();
