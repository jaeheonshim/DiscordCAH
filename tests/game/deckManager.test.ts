import { getAllPromptCards, getAllResponseCards, getRandomPromptCard, getRandomResponseCard, loadDeck } from "../../server/manager/deckManager";
import test_deck from "../../server/decks/test.json" assert {type: "json"};

describe("test getting random cards", () => {
    beforeAll(() => {
        loadDeck("test", test_deck);
    });

    test("getRandomPromptCard should return a valid prompt card", () => {
        const randomCard = getRandomPromptCard("test");

        expect(randomCard.text).toBeDefined();
        expect(randomCard.id).toBeDefined();
        expect(randomCard.pickCount).toBeDefined();
    });

    test("getRandomResponseCard should return a valid response card", () => {
        const randomCard = getRandomResponseCard("test");

        expect(randomCard.text).toBeDefined();
        expect(randomCard.id).toBeDefined();
    });

    test("getRandomResponseCard should not return excluded cards", () => {
        const exclude = new Set<string>();
        const allResponseCards = getAllResponseCards("test")!;
        
        for(let i = 0; i < allResponseCards.length - 1; ++i) {
            exclude.add(allResponseCards[i].id);
        }

        const remainingId = allResponseCards[allResponseCards.length - 1].id;

        const randomCard = getRandomResponseCard("test", exclude);
        expect(randomCard.id).toEqual(remainingId);
    });

    test("getRandomPromptCard should not return excluded cards", () => {
        const exclude = new Set<string>();
        const allPromptCards = getAllPromptCards("test")!;
        
        for(let i = 0; i < allPromptCards.length - 1; ++i) {
            exclude.add(allPromptCards[i].id);
        }

        const remainingId = allPromptCards[allPromptCards.length - 1].id;

        const randomCard = getRandomPromptCard("test", exclude);
        expect(randomCard.id).toEqual(remainingId);
    });

    test("getRandomPromptCard should return a card if all cards are excluded", () => {
        const exclude = new Set<string>();
        const allPromptCards = getAllPromptCards("test")!;
        
        for(let i = 0; i < allPromptCards.length; ++i) {
            exclude.add(allPromptCards[i].id);
        }

        const randomCard = getRandomPromptCard("test", exclude);
        expect(randomCard).toBeDefined();
    });

    test("getRandomResponseCard should return a card if all cards are excluded", () => {
        const exclude = new Set<string>();
        const allResponseCards = getAllResponseCards("test")!;
        
        for(let i = 0; i < allResponseCards.length; ++i) {
            exclude.add(allResponseCards[i].id);
        }

        const randomCard = getRandomResponseCard("test", exclude);
        expect(randomCard).toBeDefined();
    });
});