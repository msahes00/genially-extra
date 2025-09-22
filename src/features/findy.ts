import * as dom from "../core/dom.ts";
import * as genially from "../core/genially.ts";
import { Container } from "../core/container.ts";
import { Game, GameContext } from "../core/game.ts";
import { Settings } from "../core/settings.ts";

const RIGHT_SVG = `
  <svg width="48" height="48" viewBox="0 0 24 24"
       style="width:100%; height:100%; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%)">
    <path fill="green" d="M9 16.2l-3.5-3.5L4 14.3l5 5 12-12-1.4-1.4z"/>
  </svg>
`;

const PARTIAL_SVG = `
  <svg width="48" height="48" viewBox="0 0 24 24"
       style="width:100%; height:100%; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%)">
    <path fill="yellow" d="M9 16.2l-3.5-3.5L4 14.3l5 5 12-12-1.4-1.4z"/>
  </svg>
`;

const WRONG_SVG = `
  <svg width="48" height="48" viewBox="0 0 24 24"
       style="width:100%; height:100%; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%)">
    <path fill="red" d="M19 6.4l-1.4-1.4L12 10.6
        6.4 5 5 6.4 10.6 12 5 17.6l1.4 1.4
        L12 13.4l5.6 5.6 1.4-1.4L13.4 12z"/>
  </svg>
`;

/**
 * The context structure to use for the findy game.
 */
interface FindyContext extends GameContext {
    findy: HTMLDivElement;
}

genially.loadOnce(Settings.exercises.findy);
dom.init();
main();

async function main() {

    // Find all the hitboxes
    const findys = await Container.searchAll(Settings.html.findy);

    /*
    // Assign each findy an unique id
    findys.forEach((s, i) => s.element.dataset._index = `findy-${i}`);

    // Group and count the correct ones (individual ones create their own group)
    const correctGroups = new Set(
        findys
            .filter(s => s.element.dataset.correct === "true")
            .map(s => s.element.dataset.group || s.element.dataset._index)
    );
    const hitmax = correctGroups.size;
    */

    // Store the groups that have been fully marked
    let markedGroups = 0;

    // Prepare the styles for the SVGs and the pointing cursor
    findys.forEach(s => {
        s.element.style.position = "relative";
        s.element.style.cursor   = "pointer";
        s.element.style.width    = "100%";
        s.element.style.height   = "100%";
    });

    // Build the actual game
    const game = new Game({
        updateClock: dom.updateClock,
        updateScore: dom.updateScore,

        isGameEnded: (_ctx) => markedGroups >= 1, // Ensure one group is marked
        handleEnded: dom.handleEnded(Settings.exercises.findy, main),

        initContext: (ctx: FindyContext) => {
            const tgt = ctx.event.target as HTMLElement;
            const findy = findys.find(s => s.element.contains(tgt));

            if (!findy)
                throw new Error("Invalid findy");

            ctx.findy = findy.element;
        },

        isValidPick: (ctx: FindyContext) => {

            if (ctx.findy.dataset.clicked === "true")
                throw new Error("Already clicked");

            // Mark the element as clicked
            ctx.findy.dataset.clicked = "true";

            return ctx.findy.dataset.correct === "true";
        },

        handleRight: (ctx: FindyContext) => {

            const groupId = ctx.findy.dataset.group;

            // Instantly count the click, regardless of grouping
            ctx.findy.dataset.clicked = "true";
            
            // If findy is not on a group, mark it directly
            if (!groupId) {
                ctx.findy.insertAdjacentHTML("beforeend", RIGHT_SVG);
                ctx.game.hitCount++;
                markedGroups++;
                return;
            }

            // Check the findys in the group
            const groupFindys = findys.filter(s => s.element.dataset.group === groupId);
            const allClicked = groupFindys.every(s => s.element.dataset.clicked === "true");

            // Mark as partial if the whole group is not marked
            if (!allClicked) {
                ctx.findy.insertAdjacentHTML("beforeend", PARTIAL_SVG);
                return;
            }
            
            // If all are clicked, mark all as correct
            groupFindys.forEach(s => {
                s.element.insertAdjacentHTML("beforeend", RIGHT_SVG);
                ctx.game.hitCount++;
            });
            markedGroups++;
        },

        handleWrong: (ctx: FindyContext) => {

            // Add the cross SVG to the element and count it
            ctx.findy.insertAdjacentHTML("beforeend", WRONG_SVG);
            ctx.game.missCount++;
        },
    });

    findys.forEach(s => s.element.addEventListener("click", game.check));

    if (genially.isViewMode()) {
        game.start();
    }
}
