import { Game, GameOptions } from "../core/game.ts";
import { Container } from "../core/container.ts";
import { Settings } from "../settings.ts";
import { ContextWith, GameAnswer, GameWith } from "./types.ts";
import * as table from "./table.ts";
import * as spot from "./spot.ts";

/**
 * A type for the guess game data.
 */
export type GuessGame = GameAnswer & GameWith<{
    verify: HTMLButtonElement;
    holder: HTMLDivElement;
}>;

/**
 * A combined type for the guess context.
 */
export type GuessContext = table.DataContext & table.ElemContext & ContextWith<GuessGame>;


/**
 * Validates game data and combines the values from all the pieces.
 */
export const initContext = async (ctx: GuessContext) => {

    // Extract and validate the game data
    const { data } = ctx.game as GuessGame;

    // Prepare the data atribute
    ctx.data = "";

    // Concatenate and verify all the values from the pieces
    let index = 0;
    for (const child of Array.from(data.holder.children)) {

        const element = await getPieceElement(child as HTMLElement);
        const value = element.dataset.value;

        // Verify the current value and mark it if wrong
        if (value !== ctx.game.data.answer[index]) {
            spot.handleWrong({
                ...ctx,
                spot: element,
            });
        }

        // Increase the index and append the value
        index++;
        ctx.data += value;
    }

    // Set the verify buttton as the table cell to animate
    ctx.elem = data.verify;
    return ctx;
};

/**
 * The game options for the guess game.
 */
export const options = {
    // Reuse the table options
    ...table.options,
    // Override the initContext
    initContext,
    // And rewire the game validation and gameover conditions for one cell
    isGameEnded: table.isValidPick,
    isValidPick: table.isValidPick,
} as GameOptions;


/**
 * A prebuilt guess game.
 */
export const game = new Game(options) as GuessGame;


const getPieceElement = async (root: HTMLElement) => {

    // Find the piece marker
    const marker = await Container.search(Settings.html.piece, { root });
    if (!marker)
        throw new Error("Marker not found");

    return marker.element;
};