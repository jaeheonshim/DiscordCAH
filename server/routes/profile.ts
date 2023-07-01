import express from "express";
import { retrieveUsername } from "../manager/usernameManager.js";
import * as Sentry from "@sentry/node";
import { retrieveUser } from "../database/users.js";

export const profileRouter = express.Router();

profileRouter.use((req, res, next) => {
    const messageContext = {
        channelId: req.body.channelId,
        userId: req.body.userId,
        username: req.body.username || (req.body.userId ? retrieveUsername(req.body.userId) : undefined),
    }

    Sentry.setContext("message", messageContext);

    next();
});

profileRouter.post("/me", function (req, res) {
    if (
        !req.body.userId ||
        !req.body.username
    )
        throw new Error("Missing required body param(s).");

    const userId = req.body.userId;
    const username = req.body.username;
    
    retrieveUser(userId).then(user => {
        const color = Math.floor(Math.random() * 0xFFFFFF);

        res.json({
            response: [
                {
                    embeds: [
                        {
                            title: `${username}'s Profile`,
                            color: color,
                            fields: [
                                {
                                    name: "Games Played",
                                    value: user.statistics.gamesBegun,
                                    inline: true
                                },
                                {
                                    name: "Rounds Played",
                                    value: user.statistics.totalSubmissions,
                                    inline: true
                                },
                                {
                                    name: "Rounds Won",
                                    value: user.statistics.totalPoints,
                                    inline: true
                                },
                                {
                                    name: "Win Ratio",
                                    value: `${user.statistics.totalPoints / user.statistics.totalSubmissions}`,
                                    inline: true
                                }
                            ]
                        }
                    ]
                }
            ]
        })
    })
});