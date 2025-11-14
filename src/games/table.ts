import { Game, GameContext, GameOptions } from "../core/game.ts";
import { ContextWith, GameAnswer, GameHitmax, GameWith } from "./types.ts";
import * as common from "./common.ts";

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
 * A partial context type with the element.
 */
export type ElemContext = GameContext & {
    elem: HTMLElement;
}

/**
 * A partial context type with the data.
 */
export type DataContext = GameContext & {
    data: string;
}

/**
 * A type for the table game data.
 */
export type TableGame = GameAnswer & GameHitmax & GameWith<{
    table: HTMLTableElement;
}>;

/**
 * A combined type for the table context.
 */
export type TableContext = ContextWith<TableGame> & ElemContext & DataContext;


/**
 * Checks if the game reached the max hits.
 */
export const isGameEnded = (ctx: ContextWith<GameHitmax>) => ctx.game.hitCount === ctx.game.data.hitMax;

/**
 * Checks if the selected element matches the answer.
 */
export const isValidPick = (ctx: ContextWith<GameAnswer> & DataContext) => ctx.data === ctx.game.data.answer;

/**
 * Validates game data and resolves the clicked cell.
 */
export const initContext = (ctx: TableContext) => {
    
    // Extract and validate the game data
    const { data } = ctx.game as TableGame;

    // Resolve the click event
    const target = ctx.event.target as HTMLElement;
    const cell = target.closest("td");
    
    // Ensure the cell is contained
    if (!cell || !data.table.contains(cell))
        throw new Error("Invalid table cell");

    // Set the context data and return it
    ctx.elem = cell;
    ctx.data = cell.innerText;
    return ctx;
};

/**
 * Counts a correct pick once.
 */
export const handleRight = (ctx: ElemContext) => {

    // Prevent counting multiple hits
    if (ctx.elem.style.backgroundColor === COLOR_CORRECT) return;

    ctx.elem.style.backgroundColor = COLOR_CORRECT;
    ctx.game.hitCount++;
};

/**
 * Counts a wrong pick and animates it.
 */
export const handleWrong = (ctx: ElemContext) => {

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
 * The game options for the table game.
 */
export const options = {
    ...common.combined,
    initContext,
    isGameEnded,
    isValidPick,
    handleRight,
    handleWrong,
} as GameOptions;

/**
 * A prebuilt table game.
 */
export const game = new Game(options) as TableGame;