import { CAHError } from "../model/cahresponse";
import { CAHGame } from "../model/classes";

export function beginGame(game: CAHGame) {
    for(const player of Object.values(game.players)) {
        if(!player.ready) throw new CAHError("Can't begin game: not all players are ready.");
    }
}