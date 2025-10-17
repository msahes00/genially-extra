import { Game, GameContext } from "../core/game.ts";
import * as common from "./common.ts";

import { z } from "zod";

/**
 * The duration for the wrong animation.
 */
const ANIMATION_TIME = 1000;

/**
 * The background color for the correct answer.
 */
const COLOR_CORRECT = "green";

/**
 * The background color for the wrong answer.
 */
const COLOR_WRONG = "red";


/**
 * A zod schema used for validation.
 */
const schema = z.object({
    hitMax: z.number(),
    answer: z.string(),
    table: z.instanceof(HTMLTableElement),
});

/**
 * A type derived from the schema for the game and its data.
 */
type TableGame = Game & {
    data: z.infer<typeof schema>;
};

/**
 * Extended context with the clicked element.
 */
export interface TableContext extends GameContext {
    elem: HTMLElement,

    // Patch the data type
    game: TableGame;
}


/**
 * Checks if the game reached the max hits.
 */
export const isGameEnded = (ctx: TableContext) => ctx.game.hitCount === ctx.game.data.hitMax;

/**
 * Checks if the selected element matches the answer.
 */
export const isValidPick = (ctx: TableContext) => ctx.elem.innerText === ctx.game.data.answer;

/**
 * Validates game data and resolves the clicked cell.
 */
export const initContext = (ctx: TableContext) => {
    
    // Extract and validate the game data
    const {
        table,
    } = schema.parse(ctx.game.data);

    // Resolve the click event
    const target = ctx.event.target as HTMLElement;
    const cell = target.closest("td");
    
    // Ensure the cell is contained
    if (!cell || !table.contains(cell))
        throw new Error("Invalid table cell");

    ctx.elem = cell;
    return ctx;
};

/**
 * Counts a correct pick once.
 */
export const handleRight = (ctx: TableContext) => {

    // Prevent counting multiple hits
    if (ctx.elem.style.backgroundColor === COLOR_CORRECT) return;

    ctx.elem.style.backgroundColor = COLOR_CORRECT;
    ctx.game.hitCount++;
};

/**
 * Counts a wrong pick and animates it.
 */
export const handleWrong = (ctx: TableContext) => {

    const prev = ctx.elem.style.backgroundColor;

    ctx.game.missCount++;

    // Prevent multiple animations from running concurrently
    if (prev === COLOR_WRONG) return;

    ctx.elem.style.backgroundColor = COLOR_WRONG;
    setTimeout(
        () => ctx.elem.style.backgroundColor = prev,
        ANIMATION_TIME
    );
};

/**
 * A prebuilt table game.
 */
export const game = new Game({
    ...common.combined,
    initContext,
    isGameEnded,
    isValidPick,
    handleRight,
    handleWrong,
}) as TableGame;