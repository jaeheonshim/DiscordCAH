export interface CAHResponse {
    message: string;

    getMessage(): string;
}

export class CAHError extends Error implements CAHResponse {
    constructor(msg: string) {
        super(msg);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, CAHError.prototype);
    }

    getMessage(): string {
        return `🛑 **${this.message}**`;
    }
}

export class CAHSuccess implements CAHResponse {
    message: string;

    constructor(msg: string) {
       this.message = msg;
    }

    getMessage(): string {
        return `✅ **${this.message}**`;
    }
}