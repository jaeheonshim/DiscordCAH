import { retrieveUsername } from "./manager/usernameManager";
import { CAHGame, CAHGameStatus, CAHPlayer } from "./model/classes";

function sortPlayers(p1: CAHPlayer, p2: CAHPlayer) {
    if(p2.points == p1.points) {
        const compare = retrieveUsername(p1.id).localeCompare(retrieveUsername(p2.id));
        return compare;
    } else {
        return p2.points - p1.points;
    }
}

export function getPlayerString(game: CAHGame) {
    return Object.values(game.players).sort(sortPlayers).reduce<string>((prev, player) => {
        const username = retrieveUsername(player.id);
        const points = player.points;
        let str = `\`${username}\` - ${points} points`;
        
        if(game.status == CAHGameStatus.PLAYER_JOIN) {
            if(player.ready) {
                str += " (**READY**)";
            } else {
                str += " (Not Ready)";
            }
        }

        return prev + str + "\n";
    }, "").trimEnd();
}

export function isPlayerCountInsufficient(game: CAHGame): boolean { 
    return Object.values(game.players).length == 0;
}