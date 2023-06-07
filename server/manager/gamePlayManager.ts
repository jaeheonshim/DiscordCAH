import { scheduleJob } from "node-schedule";
import { CAHError, CAHSuccess } from "../model/cahresponse";
import { CAHGame, CAHGameStatus } from "../model/classes";
import { getRandomPromptCard } from "./deckManager";

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

    return new CAHSuccess("New round started!");
}