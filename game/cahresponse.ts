export interface CAHResponse {

}

export class CAHError extends Error implements CAHResponse {
    constructor(msg: string) {
        super(msg);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, CAHError.prototype);
    }
}

export class CAHSuccess implements CAHResponse {
    msg: string;

    constructor(msg: string) {
       this.msg = msg;
    }
}