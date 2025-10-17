import { Game, GameContext } from "../core/game.ts";
import { Container } from "../core/container.ts";
import * as genially from "../utils/genially.ts";
import * as common from "./common.ts";

import { z } from "zod";

/**
 * A zod schema used for validation.
 */
const schema = z.object({
    elems: z.array(z.custom<Container>((val) => val instanceof Container)),
    boxes: z.array(z.custom<Container>((val) => val instanceof Container)),
});

/**
 * A type derived from the schema for the game and its data.
 */
type DndGame = Game & {
    data: z.infer<typeof schema>;
};

/**
 * Extended context with the current object and hitbox (if found).
 */
export interface DndContext extends GameContext {
    obj: HTMLDivElement;
    box: HTMLDivElement | undefined;

    // Patch the data type
    game: DndGame;
}


/**
 * Checks if the game reached the max hits.
 */
export const isGameEnded = (ctx: DndContext) => ctx.game.hitCount === ctx.game.data.elems.length;

/**
 * Checks if the selected object matches the hitbox.
 */
export const isValidPick = (ctx: DndContext) => ctx.box?.dataset.index === ctx.obj.dataset.index;

/**
 * Validates game data and finds the object from the event and the hitbox its over if any.
 */
export const initContext = (ctx: DndContext) => {
            
    // Extract and validate the game data
    const {
        elems,
        boxes,
    } = schema.parse(ctx.game.data);

    // Get the parent group from the event target
    const group = genially.getGroup(ctx.event.target as HTMLElement);
    if (!group)
        throw new Error("Object group not found");

    // Find the object that matches the group, failing if not found
    const obj = elems
        .find(o => genially.getGroup(o.element) === group);
    
    if (!obj)
        throw new Error("Object not found");
    
    // Check if the object is on top of any hitbox
    const box = boxes
        .find(b => isOnTop(obj.element, b.element));
    
    ctx.obj = obj.element;
    ctx.box = box?.element;
    return ctx;
};

/**
 * Counts a correct match once.
 */
export const handleRight = (ctx: DndContext) => {

    // Prevent storing two hits on one object
    if (ctx.obj.dataset.correct === "true") return;

    ctx.obj.dataset.correct = "true";

    ctx.game.hitCount++;
};

/**
 * Counts a wrong match and removes a hit if necessary.
 */
export const handleWrong = (ctx: DndContext) => {

    // If the object was moved after being at the correct position,
    // remove the corresponding hit
    if (ctx.obj.dataset.correct === "true") {

        ctx.obj.dataset.correct = "false";

        // Only remove a hit if there was one
        if (ctx.game.hitCount > 0)
            ctx.game.hitCount--;
    }

    // Add a miss only if it was placed on the wrong hitbox
    if (ctx.box) game.missCount++;
};

/**
 * A prebuilt dnd game.
 */
export const game = new Game({
    ...common.combined,
    initContext,
    isGameEnded,
    isValidPick,
    handleRight,
    handleWrong,
}) as DndGame;

/**
 * Check if an object is on top of a hitbox.
 * @param obj The object to check.
 * @param box The hitbox to check.
 * @returns True if the object is on top of the hitbox, false otherwise.
 */
function isOnTop(obj: HTMLElement, box: HTMLElement) {
    const o = obj.getBoundingClientRect();
    const b = box.getBoundingClientRect();
    return (
        o.left   >= b.left   &&
        o.top    >= b.top    &&
        o.right  <= b.right  &&
        o.bottom <= b.bottom
    );
}