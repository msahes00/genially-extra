import * as dom from "../core/dom.ts";
import * as genially from "../core/genially.ts";
import { Container } from "../core/container.ts";
import { Game, GameContext } from "../core/game.ts";
import { Settings } from "../core/settings.ts";

/**
 * The context structure to use for the dnd game.
 */
interface DndContext extends GameContext {
    obj: HTMLDivElement;
    box: HTMLDivElement | undefined;
}


genially.loadOnce(Settings.exercises.dnd);
dom.init();
main();

async function main() {
    const objects = await Container.searchAll(Settings.html.obj);
    const boxes = await Container.searchAll(Settings.html.box);

    // Make the containers fit the parent
    for (const elem of [...objects, ...boxes]) {
        elem.element.style.width = "100%";
        elem.element.style.height = "100%";
    }

    const game = new Game({
        updateClock: dom.updateClock,
        updateScore: dom.updateScore,

        isGameEnded: (ctx) => ctx.game.hitCount === objects.length,
        handleEnded: dom.handleEnded(Settings.exercises.dnd, main),

        isValidPick: (ctx: DndContext) => ctx.box?.dataset.index === ctx.obj.dataset.index,

        initContext: (ctx: DndContext) => {
            const root = genially.getGroup(ctx.event.target as HTMLElement);
            if (!root) throw new Error("Object root not found");

            const obj = objects.find(o => genially.getGroup(o.element) === root);
            if (!obj) throw new Error("Object not found");

            const box = boxes.find(b => isOnTop(obj.element, b.element));

            ctx.box = box?.element;
            ctx.obj = obj.element;
        },

        handleRight: (ctx: DndContext) => {

            // Prevent storing two hits on one object
            if (ctx.obj.dataset.correct === "true") return;

            ctx.obj.dataset.correct = "true";

            ctx.game.hitCount++;
        },

        handleWrong: (ctx: DndContext) => {

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
        },

    });

    for (const obj of objects) {
        const wrapper = genially.getGroup(obj.element);
        wrapper?.addEventListener("mouseup", game.check);
    }

    if (genially.isViewMode()) {
        game.start();
    }
}

function isOnTop(obj: HTMLElement, box: HTMLElement) {
    const o = obj.getBoundingClientRect();
    const b = box.getBoundingClientRect();
    return (
        o.left >= b.left &&
        o.top >= b.top &&
        o.right <= b.right &&
        o.bottom <= b.bottom
    );
}