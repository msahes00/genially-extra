import { Game, GameContext, GameOptions } from "../core/game.ts";
import { Container } from "../core/container.ts";
import { ContextWith, GameHitmax, GameWith } from "./types.ts";
import * as common from "./common.ts";

/**
 * A green tick svg.
 */
const RIGHT_SVG = `
  <svg width="48" height="48" viewBox="0 0 24 24"
       style="width:100%; height:100%; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%)">
    <path fill="green" d="M9 16.2l-3.5-3.5L4 14.3l5 5 12-12-1.4-1.4z"/>
  </svg>
`;

/**
 * A yellow tick svg.
 */
const PARTIAL_SVG = `
  <svg width="48" height="48" viewBox="0 0 24 24"
       style="width:100%; height:100%; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%)">
    <path fill="yellow" d="M9 16.2l-3.5-3.5L4 14.3l5 5 12-12-1.4-1.4z"/>
  </svg>
`;

/**
 * A red cross svg.
 */
const WRONG_SVG = `
  <svg width="48" height="48" viewBox="0 0 24 24"
       style="width:100%; height:100%; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%)">
    <path fill="red" d="M19 6.4l-1.4-1.4L12 10.6
        6.4 5 5 6.4 10.6 12 5 17.6l1.4 1.4
        L12 13.4l5.6 5.6 1.4-1.4L13.4 12z"/>
  </svg>
`;

/**
 * A partial context type with the spot element.
 */
export type SpContext = GameContext & {
    spot: HTMLDivElement;
}

/**
 * A type for the table game data.
 */
export type SpotGame = GameHitmax & GameWith<{
    marked: number;
    spots: Container[];
}>;

/**
 * A combined type for the table context.
 */
export type SpotContext = ContextWith<SpotGame> & SpContext;


/**
 * Checks if a spot is correct.
 */
export const isValidPick = (ctx: SpContext) => ctx.spot.dataset.correct === "true";

/**
 * Checks when all the spots have been fully marked.
 */
export const isGameEnded = (ctx: ContextWith<SpotGame>) => ctx.game.data.marked >= ctx.game.data.hitMax;

/**
 * Validates game data and resolves the clicked spot.
 */
export const initContext = (ctx: SpotContext) => {

    // Extract and validate the game data
    const { data } = ctx.game as SpotGame;

    // Get the target spot
    const tgt = ctx.event.target as HTMLElement;
    const spot = data.spots.find(s => s.element.contains(tgt));

    if (!spot)
        throw new Error("Invalid spot");


    ctx.spot = spot.element;
    return ctx;
};

/**
 * Counts a correct click and shows a tick.
 */
export const handleRight = (ctx: SpotContext) => {

    // Count only the first click
    if (markClicked(ctx.spot)) return;

    const groupId = ctx.spot.dataset.group;

    // Prefilter the spots and get the raw HTMLElements
    let groupSpots = ctx.game.data.spots
        .filter(s => s.element.dataset.group === groupId)
        .map(s => s.element);

    
    // If non-grouped, modify the group to only contain that spot
    if (!groupId) groupSpots = [ctx.spot];


    // Check all the spots in the group
    const allClicked = groupSpots.every(s => isClicked(s));

    // Mark as partial if the whole group is not clicked
    if (!allClicked) {
        ctx.spot.insertAdjacentHTML("beforeend", PARTIAL_SVG);
        return;
    }
    
    // If all are clicked, mark all as correct
    groupSpots.forEach(s => {
        s.insertAdjacentHTML("beforeend", RIGHT_SVG);
        ctx.game.hitCount++;
    });

    // Count one group as marked
    ctx.game.data.marked++;
};

/**
 * Counts a wrong click and shows a cross.
 */
export const handleWrong = (ctx: SpContext) => {

    // Count only the first click
    if (markClicked(ctx.spot)) return;

    // Add the cross SVG to the element and count it
    ctx.spot.insertAdjacentHTML("beforeend", WRONG_SVG);
    ctx.game.missCount++;
};

/**
 * 
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
 * A prebuilt spot game.
 */
export const game = new Game(options) as SpotGame;


/**
 * Marks a spot as clicked (if it hasnt been already).
 * @param spot The spot to mark.
 * @returns True if the spot was already clicked, false otherwise. 
 */
const markClicked = (spot: HTMLDivElement) => {

    // Check its value and then mark it 
    const clicked = isClicked(spot);
    spot.dataset.clicked = "true";

    return clicked;
};

/**
 * Checks if a spot is clicked.
 * @param spot The spot to check.
 * @returns True if the spot is clicked, false otherwise.
 */
const isClicked = (spot: HTMLDivElement) => spot.dataset.clicked === "true";