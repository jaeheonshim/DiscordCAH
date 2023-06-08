import { scheduleJob } from "node-schedule";
import { CAHError, CAHSuccess } from "../model/cahresponse";
import { CAHGame, CAHGameStatus, CAHPlayer } from "../model/classes";
import { getRandomPromptCard, getRandomResponseCard } from "./deckManager";

export function isReadyToBeginGame(game: CAHGame) {
    if(game.status != CAHGameStatus.PLAYER_JOIN) return false;

    if(Object.values(game.players).length < 2) return false;

    for(const player of Object.values(game.players)) {
        if(!player.ready) return false;
    }

    return true;
}

export function beginGame(game: CAHGame) {
    if(!isReadyToBeginGame(game)) throw new CAHError("Cannot begin game.");
    game.status = CAHGameStatus.PENDING_ROUND_START;

    const date: Date = new Date();
    date.setUTCMilliseconds(date.getUTCMilliseconds() + game.timing.beginGameDelay);

    return date.getTime();
}

export function newRound(game: CAHGame) {
    if(game.status == CAHGameStatus.PLAYER_JOIN) throw new CAHError("The game must begin before a round starts.");
    game.roundNumber += 1;
    game.promptCard = getRandomPromptCard(game.deckId, game.usedPromptCards);
    game.status = CAHGameStatus.PLAYER_SUBMIT_CARD;

    if(game.winner) {
        game.judge = game.winner;
    } else {
        const players = Object.values(game.players);
        game.judge = players[Math.floor(Math.random() * players.length)];
    }

    game.winner = null;

    for(const entry of game.submitted) {
        const cards = entry.player.cards;
        const filtered = cards.filter((c) => entry.cards.includes(c));
        entry.player.cards = filtered;
    }
    game.submitted.length = 0;

    const usedCards = new Set<string>();

    for(const player of Object.values(game.players)) {
        // clear previous values
        player.submitted.length = 0;

        if(!player.cards) player.cards = [];
        for(const card of player.cards) usedCards.add(card.id);
    }

    for(const player of Object.values(game.players)) {
        while(player.cards.length < game.cardHandCount) {
            const card = getRandomResponseCard(game.deckId, usedCards);
            player.cards.push(card);
            usedCards.add(card.id);
        }
    }

    return new CAHSuccess("New round started!");
}

export function playerSubmitCard(game: CAHGame, player: CAHPlayer, cardIndex: number) {
    if(player.id === game.judge.id) throw new CAHError("The judge cannot submit cards during this stage.");
    if(game.status != CAHGameStatus.PLAYER_SUBMIT_CARD) throw new CAHError("You cannot submit cards right now.");
    if(player.submitted.length === game.promptCard.pickCount) throw new CAHError("You have already submitted your cards for this round.");

    let card;

    try {
        card = player.cards[cardIndex];
    } catch(e) {
        throw new CAHError("Card with that index not found!");
    }

    if(player.submitted.includes(card)) throw new CAHError("You've already submitted that card!");

    player.submitted.push(card);

    return new CAHSuccess("Submitted card");
}

export function judgeSubmitCard(game: CAHGame, cardIndex: number) {
    if(game.status != CAHGameStatus.JUDGE_SELECT_CARD) throw new CAHError("You cannot submit cards right now.");

    let card;

    try {
        card = game.submitted[cardIndex];
        if(!card) throw new Error("Nonexistent");
    } catch(e) {
        throw new CAHError("Submission with that index not found!");
    }

    const winner: CAHPlayer = card.player;
    game.winner = winner;
    winner.points += 1;
    game.judge = winner;

    game.status = CAHGameStatus.ROUND_END;

    return new CAHSuccess("Successfully chose winning submission!");
}

export function haveAllPlayersSubmitted(game: CAHGame) {
    for(const player of Object.values(game.players)) {
        if(player.id === game.judge.id) continue;
        if(player.submitted.length < game.promptCard.pickCount) {
            return false;
        }
    }

    return true;
}

export function startJudgeStage(game: CAHGame) {
    if(game.status != CAHGameStatus.PLAYER_SUBMIT_CARD) throw new CAHError("Can't start judging stage from this stage");

    game.status = CAHGameStatus.JUDGE_SELECT_CARD;
}