import express from "express";
import { createNewGame, deleteGameByChannelId, deleteGameById, retrieveGameByChannelId, retrieveGameById } from "../manager/gameStorageManager";
import {
    playerInGame,
    playerJoinGame,
    playerLeaveGame,
    playerReady,
    retrievePlayerById,
} from "../manager/gamePlayerManager";
import { CAHError } from "../model/cahresponse";
import { cacheUsername, retrieveUsername } from "../manager/usernameManager";
import { getJudgeModal, getPlayerRoundComponents, getPlayerRoundEmbed, getPlayerString, getRoundResultModal, isPlayerCountInsufficient, randomFunFact, randomJoke, shuffle } from "../util";
import { beginGame, haveAllPlayersSubmitted, isReadyToBeginGame, judgeSubmitCard, newRound, playerSubmitCard, startJudgeStage } from "../manager/gamePlayManager";
import { CAHGameStatus, CAHPlayer } from "../model/classes";
import { ResponseCard } from "../model/cards";

export const gameRouter = express.Router();

gameRouter.post("/new", function (req, res) {
    if (
        !req.body.channelId ||
        !req.body.userId ||
        !req.body.displayAvatarURL ||
        !req.body.username
    )
        throw new Error("Missing required body param(s).");

    const channelId = req.body.channelId;
    const userId = req.body.userId;
    const username = req.body.username;

    cacheUsername(userId, username);

    if (playerInGame(userId)) throw new CAHError("You're already in a game!");

    const newGame = createNewGame(channelId);
    const joinResponse = playerJoinGame(newGame.id, userId);

    if (req.body.channelName) newGame.details.channelName = req.body.channelName;
    if (req.body.serverName) newGame.details.serverName = req.body.serverName;

    const botResponse = {
        gameId: newGame.id,
        response: [
            {
                embeds: [
                    {
                        color: 0x00ff00,
                        title: `\`${username}\` has created a new game!`,
                        thumbnail: {
                            url: req.body.displayAvatarURL,
                        },
                        description:
                            "To join this game, run `/join` inside this channel. Before joining, make sure you aren't in any other games.\n\nThe game will begin once all players are ready. **Once you're ready to begin, make sure to let the bot know by running `/begin`**!",
                        timestamp: new Date().toISOString(),
                    },
                ],
            },
            { content: joinResponse.getMessage(), ephemeral: true },
        ],
    };

    res.json(botResponse);
});

gameRouter.post("/info", function (req, res) {
    if (
        !req.body.channelId ||
        !req.body.userId ||
        !req.body.username
    )
        throw new Error("Missing required body param(s).");

    const channelId = req.body.channelId;
    const userId = req.body.userId;
    const username = req.body.username;

    cacheUsername(userId, username);

    const game = retrieveGameByChannelId(channelId);

    const botResponse = {
        response: [
            {
                embeds: [
                    {
                        color: 0x0096FF,
                        title: `Game Information`,
                        fields: [
                            {
                                name: "Server",
                                value: `\`${game.details.serverName}\``
                            },
                            {
                                name: "Channel",
                                value: `<#${game.channelId}>`
                            },
                            {
                                name: "Players",
                                value: getPlayerString(game)
                            }
                        ],
                        timestamp: new Date().toISOString(),
                    },
                ],
            }
        ],
    };

    res.json(botResponse);
});

gameRouter.post("/end", function (req, res) {
    if (
        !req.body.channelId ||
        !req.body.userId ||
        !req.body.username
    )
        throw new Error("Missing required body param(s).");

    const channelId = req.body.channelId;
    const userId = req.body.userId;
    const username = req.body.username;

    cacheUsername(userId, username);

    const deleteResponse = deleteGameByChannelId(channelId);

    const botResponse = {
        response: [
            {
                content: deleteResponse.getMessage(), embeds: [
                    {
                        title: "Game Ended",
                        description: "The game in this channel has been ended by a server administrator."
                    }
                ]
            }
        ]
    }

    res.json(botResponse);
});

gameRouter.post("/join", function (req, res) {
    if (
        !req.body.channelId ||
        !req.body.userId ||
        !req.body.username
    )
        throw new Error("Missing required body param(s).");

    const channelId = req.body.channelId;
    const userId = req.body.userId;
    const username = req.body.username;

    cacheUsername(userId, username);

    const joinResponse = playerJoinGame(retrieveGameByChannelId(channelId).id, userId);

    res.json({
        response: [
            { content: joinResponse.getMessage(), ephemeral: true }
        ],
        channelMessage: {
            channelId: channelId,
            message: {
                content: `👋 ${username} joined the game!`
            }
        }
    });
});

gameRouter.post("/leave", function (req, res) {
    if (
        !req.body.userId ||
        !req.body.username
    )
        throw new Error("Missing required body param(s).");

    const userId = req.body.userId;
    const username = req.body.username;

    cacheUsername(userId, username);

    const player = retrievePlayerById(userId);
    const leaveResponse = playerLeaveGame(userId);

    const botResponse: any = {
        response: [
            {
                content: leaveResponse.getMessage(), ephemeral: true
            }
        ],
        channelMessage: {
            channelId: player.game.channelId,
            message: { content: `😕 ${username} left the game.` }
        }
    }

    if (isPlayerCountInsufficient(player.game)) {
        deleteGameById(player.game.id);
        botResponse.channelMessage = {
            channelId: player.game.channelId,
            message: {
                embeds: [{
                    title: "Game Ended",
                    description: "The game in this channel has been ended because there aren't enough players."
                }]
            }
        }
    }

    if (player.game.status == CAHGameStatus.PLAYER_SUBMIT_CARD || player.game.status == CAHGameStatus.JUDGE_SELECT_CARD) {
        if (player.id === player.game.judge.id) {
            player.game.status = CAHGameStatus.PENDING_ROUND_START;
            const nextRoundBeginTime = Date.now() + player.game.timing.nextRoundDelay;

            botResponse.channelMessage = {
                channelId: player.game.channelId,
                message: {
                    embeds: [{
                        title: "Judge left game",
                        description: `The judge left the game, so this round cannot continue. A new round will begin <t:${Math.round(nextRoundBeginTime / 1000)}:R>.`
                    }]
                }
            }

            botResponse.gameId = player.game.id;
            botResponse.nextRoundBeginTime = nextRoundBeginTime;
        }
    }

    res.json(botResponse);
});

gameRouter.post("/ready", function (req, res) {
    if (
        !req.body.channelId ||
        !req.body.userId ||
        !req.body.username
    )
        throw new Error("Missing required body param(s).");

    const userId = req.body.userId;
    const username = req.body.username;

    cacheUsername(userId, username);

    const readyResponse = playerReady(userId);

    const game = retrievePlayerById(userId).game;
    if (isReadyToBeginGame(game)) {
        const beginTime = beginGame(game);
        const botResponse = {
            response: [
                {
                    content: readyResponse.getMessage(),
                    embeds: [{
                        title: "All Players Ready!",
                        color: 0xFFFF00,
                        description: `The game will begin <t:${Math.round(beginTime / 1000)}:R>!`
                    }]
                }
            ],
            gameBeginTime: beginTime,
            gameId: game.id,
            channelId: game.channelId
        }
        res.json(botResponse);
    } else {
        res.json({
            response: [
                { content: readyResponse.getMessage() }
            ]
        });
    }
});

gameRouter.post("/newRound", function (req, res) {
    if (!req.body.gameId)
        throw new Error("Missing required body param(s).");

    const reqGame = retrieveGameById(req.body.gameId);
    if (reqGame.status != CAHGameStatus.PENDING_ROUND_START) {
        throw new Error("Invalid game status for request");
    }

    const newRoundResponse = newRound(reqGame);
    const judgeBeginTime = Date.now() + reqGame.timing.roundDuration;

    const newRoundEmbed = {
        color: 0x0000FF,
        title: `Round #${reqGame.roundNumber}`,
        description: `**Prompt:**\n\`${reqGame.promptCard.text}\`\n\u200B`,
        fields: [
            {
                name: "🧐 Judge",
                value: retrieveUsername(reqGame.judge.id)
            },
            {
                name: "⌛ Time Remaining",
                value: `Round ends <t:${Math.round(judgeBeginTime / 1000)}:R>`
            },
            {
                name: "🧍 Players",
                value: getPlayerString(reqGame)
            }
        ]
    }

    const individualMessages = {};
    for (const player of Object.values(reqGame.players)) {
        if (player.id === reqGame.judge.id) {
            individualMessages[player.id] = {
                embeds: [{
                    title: "You are the judge!",
                    color: 0xFFFF00,
                    description: `Sit tight while the other players are submitting their cards. Once all cards have been submitted, you'll have a chance to choose the best one.\n\nWhile you wait, how about a joke?\n${randomJoke()}`,
                }]
            }
        } else {
            individualMessages[player.id] = {
                embeds: [getPlayerRoundEmbed(reqGame, player.id)],
                components: getPlayerRoundComponents(reqGame, player.id)
            }
        }
    }

    res.json({
        channelMessage: {
            channelId: reqGame.channelId,
            message: { content: newRoundResponse.getMessage(), embeds: [newRoundEmbed] }
        },
        individualMessages,
        judgeBeginTime
    });
});

gameRouter.post("/submit", function (req, res) {
    if (
        !req.body.channelId ||
        !req.body.userId ||
        req.body.index === undefined
    )
        throw new Error("Missing required body param(s).");

    const userId = req.body.userId;
    const index = req.body.index;
    const username = req.body.username;

    cacheUsername(userId, username);

    const player = retrievePlayerById(userId);
    const game = player.game;

    if (game.judge.id === player.id) {
        const submitResponse = judgeSubmitCard(game, index);
        const resultDisplayTime = Date.now() + game.timing.resultDisplayWait;

        res.json({
            response: [{
                content: submitResponse.getMessage(),
                embeds: [{
                    title: "Return to game channel",
                    description: `<#${game.channelId}>`
                }]
            }],
            channelMessage: {
                channelId: game.channelId,
                message: {
                    embeds: [
                        {
                            title: "The judge has chosen the winning submission!",
                            description: `Results will be displayed <t:${Math.round(resultDisplayTime / 1000)}:R>`
                        }
                    ]
                }
            },
            resultDisplayTime: resultDisplayTime,
            gameId: game.id
        });
    } else {
        const submitResponse = playerSubmitCard(game, player, index);
        const isFinishedSubmitting = player.submitted.length === game.promptCard.pickCount;

        const botResponse = {
            response: [
                { content: submitResponse.getMessage() }
            ],
            allSubmitted: haveAllPlayersSubmitted(game),
            gameId: game.id,
            channelId: game.channelId
        };

        const cardLines = [];

        for (let i = 0; i < player.submitted.length; ++i) {
            cardLines.push(`${i + 1}. \`${player.submitted[i].text}\``);
        }

        if (isFinishedSubmitting) {
            botResponse["channelMessage"] = {
                channelId: game.channelId,
                message: { content: `\`${retrieveUsername(userId)}\` has finished submitting their cards 💯` }
            };

            botResponse.response[0]["embeds"] = [{
                title: "Finished Submitting",
                color: 0x00FF00,
                description: "You have finished submitting your cards! Sit tight while the other players wrap up.",
                fields: [
                    {
                        name: "Submitted cards",
                        value: cardLines.join("\n")
                    },
                    {
                        name: "Return to game channel",
                        value: `<#${game.channelId}>`
                    }
                ]
            }];
        } else {
            botResponse.response[0]["embeds"] = [
                {
                    title: "Submit More Cards",
                    color: 0xFFFF00,
                    description: `**You're not done yet!** You still need to submit ${game.promptCard.pickCount - player.submitted.length} more cards.`,
                    fields: [
                        {
                            name: "Submitted Cards",
                            value: cardLines.join("\n")
                        }
                    ]
                },
                getPlayerRoundEmbed(game, userId)
            ];
            botResponse.response[0]["components"] = getPlayerRoundComponents(game, userId);
        }

        res.json(botResponse);
    }
});

gameRouter.post("/beginJudging", function (req, res) {
    if (!req.body.gameId)
        throw new Error("Missing required body param(s).");

    const reqGame = retrieveGameById(req.body.gameId);

    if (req.body.validRoundNumber) {
        if (reqGame.roundNumber != req.body.validRoundNumber) res.status(200).send();
    }

    startJudgeStage(reqGame);

    const beginJudgingEmbed = {
        color: 0x0000FF,
        title: `Judging will now commence!`,
        description: `The judge, ${retrieveUsername(reqGame.judge.id)}, will now select the winner for this round.\n\nIn the meantime, here's an interesting fact:\n${randomFunFact()}`,
    }

    const submitted: {
        cards: ResponseCard[],
        player: CAHPlayer
    }[] = [];

    for (const player of Object.values(reqGame.players)) {
        if (player.submitted.length === reqGame.promptCard.pickCount) {
            submitted.push({
                cards: player.submitted,
                player: player
            });
        }
    }

    shuffle(submitted);
    reqGame.submitted = submitted;

    if (reqGame.submitted.length == 0) {
        // if nobody submitted a card, end the game
        const deleteResponse = deleteGameById(reqGame.id);

        const botResponse = {
            channelMessage: {
                channelId: reqGame.channelId,
                message: {
                    embeds: [
                        {
                            title: "Game Ended",
                            description: "The game in this channel ended because nobody submitted a card."
                        }
                    ]
                }
            }
        }

        res.json(botResponse);
        return;
    }

    const response = {
        channelMessage: {
            channelId: reqGame.channelId,
            message: { embeds: [beginJudgingEmbed] }
        },
        individualMessages: {
            [reqGame.judge.id]: { embeds: [getJudgeModal(reqGame)] }
        }
    }

    res.json(response);
});


gameRouter.post("/endRound", function (req, res) {
    if (!req.body.gameId)
        throw new Error("Missing required body param(s).");

    const game = retrieveGameById(req.body.gameId);

    game.status = CAHGameStatus.PENDING_ROUND_START;
    const nextRoundBeginTime = Date.now() + game.timing.nextRoundDelay;

    const response = {
        channelMessage: {
            channelId: game.channelId,
            message: {
                embeds: [getRoundResultModal(game), {
                    title: "Next Round",
                    description: `The next round will begin <t:${Math.round(nextRoundBeginTime / 1000)}:R>.`
                }]
            }
        },
        roundBeginTime: nextRoundBeginTime,
        gameId: game.id,
    }

    res.json(response);
});