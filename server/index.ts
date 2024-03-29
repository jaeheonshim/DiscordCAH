import express from "express";
import { gameRouter } from "./routes/game.js";
import bodyParser from "body-parser";
import { CAHError } from "./model/cahresponse.js";
import * as Sentry from "@sentry/node";
import tokenAuth from "./apiAuth.js";
import config from "./config.json" assert {type: "json"};
import { apiRouter } from "./routes/api.js";
import { connect } from "mongoose";
import { decksRouter } from "./routes/decks.js";
import { profileRouter } from "./routes/profile.js";

const app = express();
const port = config.port;

Sentry.init({
  dsn: "https://84a64a7b5d2b4d608bc273694acfe251@o573198.ingest.sentry.io/4505326077149184",
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Sentry.Integrations.Express({ app }),
    // Automatically instrument Node.js libraries and frameworks
    ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

// mongodb initialization
connect(config.mongodbURI);

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

app.use(bodyParser.json());

app.listen(port, () => {
  console.log("Server started at port", port);
});

app.use("/bot/game", tokenAuth, gameRouter);
app.use("/bot/profile", tokenAuth, profileRouter);
app.use("/bot/decks", tokenAuth, decksRouter);
app.use("/api", tokenAuth, apiRouter);

app.use(Sentry.Handlers.errorHandler({
  shouldHandleError: (error) => !(error instanceof CAHError) 
}));

// Error handler
app.use((err, req, res, next) => {
  if (err instanceof CAHError) {
    res.status(200).send({
      response: [{ content: err.getMessage(), ephemeral: true }],
    });
  } else {
    console.error("A server error occurred. Error has been reported to sentry.");
    res.status(200).send({
      response: [
        {
          embeds: [
            {
              title: "Server Error",
              color: 0xff0000,
              description:
                "Unfortunately, a server error has occurred while processing your request. This is usually due to an issue with the bot and probably not the fault of the user.",
              fields: [
                {
                  name: "Additional Message",
                  value: err.message || "No message.",
                },
                {
                  name: "Report Issue",
                  value: "If you'd like to report this issue, you may do so by using the command `/contact`. Please provide as much information about the situation as possible."
                }
              ],
            },
          ],
          ephemeral: true,
        },
      ],
    });
  }
});