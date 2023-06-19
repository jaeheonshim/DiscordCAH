import base from "../decks/base_us.json" assert {type: "json"};
import apples from "../decks/apples.json" assert {type: "json"};
import { v4 as uuidv4 } from 'uuid';
import { PromptCard, ResponseCard } from "../model/cards.js";

const promptCards = new Map<string, [PromptCard]>();
const responseCards = new Map<string, [ResponseCard]>();
const deckMetaData = new Map<string, any>();

export function isDeckLoaded(id: string): boolean {
    return promptCards.has(id) && responseCards.has(id) && deckMetaData.has(id);
}

export function getDeckMetaData(id: string) {
    return deckMetaData.get(id);
}

export function getAllDeckIds() {
    return Array.from(deckMetaData.keys());
}

export function loadDeck(id: string, json) {
    const prompt = json.prompt;
    const response = json.response;

    for(const card of prompt) {
        card.id = uuidv4();
    }

    for(const card of response) {
        card.id = uuidv4();
    }

    promptCards.set(id, prompt);
    responseCards.set(id, response);
    deckMetaData.set(id, {
        shortDescription: json.shortDescription,
        longDescription: json.longDescription
    });
}

export function getAllPromptCards(id: string) {
    return promptCards.get(id);
}

export function getAllResponseCards(id: string) {
    return responseCards.get(id);
}

export function getRandomPromptCard(id: string, excludeList?: Set<string>): PromptCard {
    const prompt = promptCards.get(id);
    if(!excludeList) return prompt[Math.floor(Math.random() * prompt.length)];

    const filtered = prompt.filter(c => !excludeList.has(c.id));

    if(filtered.length == 0) {
        return prompt[Math.floor(Math.random() * prompt.length)];
    } else {
        return filtered[Math.floor(Math.random() * filtered.length)];
    }
}

export function getRandomResponseCard(id: string, excludeList?: Set<string>): ResponseCard {
    const response = responseCards.get(id);
    if(!excludeList) return response[Math.floor(Math.random() * response.length)];
    
    const filtered = response.filter(c => !excludeList.has(c.id));

    if(filtered.length == 0) {
        return response[Math.floor(Math.random() * response.length)];
    } else {
        return filtered[Math.floor(Math.random() * filtered.length)];
    }
}

loadDeck("base_us", base);
loadDeck("apples", apples);