import express from "express";
import { gameRouter } from "./routes/game";
import bodyParser from "body-parser";
import { CAHError } from "./model/cahresponse";

const app = express();
const port = 8080;

app.use(bodyParser.json());

app.listen(port, () => {
  console.log("Server started at port", port);
});

app.use("/bot/game", gameRouter);

// Error handler
app.use((err, req, res, next) => {
  if (err instanceof CAHError) {
    res.status(200).send({
      response: [{ content: err.getMessage(), ephemeral: true }],
    });
  } else {
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
              ],
            },
          ],
          ephemeral: true,
        },
      ],
    });
  }
});
