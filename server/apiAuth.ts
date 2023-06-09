import { NextFunction, Request, Response } from "express";
import config from "./config.json" assert {type: "json"};

export default function tokenAuth(req: Request, res: Response, next: NextFunction): void {
    if(!req.headers.authorization || req.headers.authorization.split(' ').length != 2) {
        res.sendStatus(403);
        return;
    }


    const token = req.headers.authorization.split(' ')[1];
    if(token === config.apiToken) {
        next();
    } else {
        res.sendStatus(403);
    }
}