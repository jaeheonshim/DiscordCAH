import { v4 as uuidv4 } from 'uuid';

export enum CAHGameStatus {
    PLAYER_JOIN
}

export class CAHGame {
    id: string = uuidv4();
    channelId: string;
    players: Record<string, CAHPlayer> = {};
    deleted: boolean = false;
    status: CAHGameStatus = CAHGameStatus.PLAYER_JOIN;

    details = {
        serverName: "unknown",
        channelName: "unknown"
    }
}

export class CAHPlayer {
    id: string;
    game: CAHGame;
    points: number = 0;
    ready: boolean;
    
    constructor(id: string) {
        this.id = id;
    }
}