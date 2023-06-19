import express from "express";
import { retrieveUsername } from "../manager/usernameManager.js";
import * as Sentry from "@sentry/node";
import { getAllDeckIds, getDeckMetaData } from "../manager/deckManager.js";

export const decksRouter = express.Router();

// add context
decksRouter.use((req, res, next) => {
    const messageContext = {
        userId: req.body.userId,
        username: req.body.username || (req.body.userId ? retrieveUsername(req.body.userId) : undefined),
    }

    Sentry.setContext("message", messageContext);

    next();
});

decksRouter.post("/list", function (req, res) {
    const deckIds = getAllDeckIds();

    const botResponse = {
        response: [
            {
                embeds: [
                    {
                        color: 0xFF5733 ,
                        title: `Built-in Decks`,
                        description: deckIds.reduce((prev, id) => prev + `\`${id}\` - ${getDeckMetaData(id).shortDescription}\n`, "").trimEnd(),
                        fields: [
                            {
                                name: "How to use",
                                value: "Run `/new` followed by the id of the deck you want to use. For example: `/new base_us`"
                            }
                        ]
                    },
                ],
                ephemeral: true
            }
        ],
    };

    res.json(botResponse);
});