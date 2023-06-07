import { v4 as uuidv4 } from 'uuid';

export class CAHGame {
    id: string = uuidv4();
    channelId: string;
    players: Record<string, CAHPlayer> = {};
    deleted: boolean = false;

    details = {
        serverName: "unknown",
        channelName: "unknown"
    }
}

export class CAHPlayer {
    id: string;
    game: CAHGame;
    points: number = 0;
    
    constructor(id: string) {
        this.id = id;
    }
}