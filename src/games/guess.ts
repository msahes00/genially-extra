import { Game, GameContext } from "../core/game.ts";
import { Container } from "../core/container.ts";
import { Settings } from "../settings.ts";
import * as common from "./common.ts";
import * as table from "./table.ts";

import { z } from "zod";

/**
 * A zod schema used for validation.
 */
const schema = z.object({
    verify: z.instanceof(HTMLButtonElement),
    holder: z.instanceof(HTMLDivElement),
    answer: z.string(),
});

/**
 * A type derived from the schema for the game and its data.
 */
type GuessGame = Game & {
    data: z.infer<typeof schema>;
};

/**
 * Extended context with the current content data.
 */
export interface GuessContext extends GameContext {
    data: string;
    elem: HTMLElement;

    // Patch the data type
    game: GuessGame;
}


/**
 * Checks if the data from the selected elements matches the answer.
 */
export const isValidPick = (ctx: GuessContext) => ctx.data === ctx.game.data.answer;

/**
 * An alias for isValidPick since the game ends when a valid pick is made.
 * @see {@link isValidPick}
 */
export const isGameEnded = isValidPick;

/**
 * Validates game data and combines the values from all the pieces.
 */
export const initContext = async (ctx: GuessContext) => {

    // Extract and validate the game data
    const {
        verify,
        holder,
    } = schema.parse(ctx.game.data);

    // Prepare the data atribute
    ctx.data = "";

    // Concatenate all the values from the pieces
    for (const child of Array.from(holder.children)) {
        const root = child as HTMLElement;

        const marker = await Container.search(Settings.html.piece, { root });
        if (!marker)
            throw new Error("Marker not found");

        ctx.data += marker.element.dataset.value;
    }

    // Set the verify buttton as the table cell to animate
    ctx.elem = verify;
    return ctx;
};

/**
 * A prebuilt guess game.
 */
export const game = new Game({
    ...common.combined,
    initContext,
    isGameEnded,
    isValidPick,
    handleRight: table.handleRight,
    handleWrong: table.handleWrong,
}) as GuessGame;