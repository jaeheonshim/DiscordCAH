import { retrieveUsername } from "./manager/usernameManager";
import { CAHGame } from "./model/classes";

export function getPlayerString(game: CAHGame) {
    return Object.values(game.players).reduce<string>((prev, player) => {
        const username = retrieveUsername(player.id);
        const points = player.points;
        const str = `\`${username}\` - ${points} points`;

        return prev + str + "\n";
    }, "").trimEnd();
}