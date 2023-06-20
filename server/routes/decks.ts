import express from "express";
import { retrieveUsername } from "../manager/usernameManager.js";
import * as Sentry from "@sentry/node";
import { getAllDeckIds, getDeckMetaData } from "../manager/deckManager.js";
import { CAHError } from "../model/cahresponse.js";

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

decksRouter.post("/get/:id", function (req, res) {
    const deckId = req.params.id.toLowerCase();
    const deck = getDeckMetaData(deckId);

    if(!deck) {
        throw new CAHError("Sorry, that's not a valid deck id! Run `/decks` to see all available decks.");
    }

    let product = 1;
    for(let i = 0; i < deckId.length; ++i) {
        product *= deckId.charCodeAt(i);
    }

    const color = product % (0xFFFFFF + 1);
    
    const botResponse = {
        response: [
            {
                embeds: [
                    {
                        color: color,
                        title: `Deck "${deckId}"`,
                        fields: [
                            {
                                name: "ID",
                                value: deckId
                            },
                            {
                                name: "Short Description",
                                value: deck.shortDescription
                            },
                            {
                                name: "Long Description",
                                value: deck.longDescription
                            },
                            {
                                name: "How to use",
                                value: `Run \`/new ${deckId}\` to create a new game with this deck.`
                            }
                        ]
                    },
                ],
                ephemeral: true
            }
        ],
    };

    res.json(botResponse);
})

decksRouter.post("/list", function (req, res) {
    const deckIds = getAllDeckIds();

    const botResponse = {
        response: [
            {
                embeds: [
                    {
                        color: 0xFF5733 ,
                        title: `Built-in Decks`,
                        description: deckIds.reduce((prev, id) => prev + `\`${id.toLowerCase()}\` - ${getDeckMetaData(id).shortDescription}\n`, "").trimEnd(),
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