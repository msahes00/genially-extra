import * as dom from "../utils/dom.ts";
import * as genially from "../utils/genially.ts";
import { Container } from "../core/container.ts";
import { Game, GameContext } from "../core/game.ts";
import { Settings } from "./settings.ts";

const RIGHT_SVG = `
  <svg width="48" height="48" viewBox="0 0 24 24"
       style="width:100%; height:100%; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%)">
    <path fill="green" d="M9 16.2l-3.5-3.5L4 14.3l5 5 12-12-1.4-1.4z"/>
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
 * The context structure to use for the spot game.
 */
interface SpotContext extends GameContext {
    spot: HTMLDivElement;
}

genially.loadOnce(Settings.exercises.spot);
dom.init();
main();

async function main() {

    // Find all the hitboxes and count the total number of correct ones
    const spots  = await Container.searchAll(Settings.html.spot);
    const hitmax = spots.filter(s => s.element.dataset.correct === "true").length;

    // Prepare the styles for the SVGs and the pointing cursor
    spots.forEach(s => {
        s.element.style.position = "relative";
        s.element.style.cursor   = "pointer";
        s.element.style.width    = "100%";
        s.element.style.height   = "100%";
    });

    // Build the actual game
    const game = new Game({
        updateClock: dom.updateClock,
        updateScore: dom.updateScore,

        isGameEnded: (ctx) => ctx.game.hitCount === hitmax,
        handleEnded: dom.handleEnded(Settings.exercises.spot, main),

        initContext: (ctx: SpotContext) => {
            const tgt = ctx.event.target as HTMLElement;
            const spot = spots.find(s => s.element.contains(tgt));

            if (!spot)
                throw new Error("Invalid spot");

            ctx.spot = spot.element;
            
            return ctx;
        },

        isValidPick: (ctx: SpotContext) => {

            if (ctx.spot.dataset.clicked === "true")
                throw new Error("Already clicked");

            // Mark the element as clicked
            ctx.spot.dataset.clicked = "true";

            return ctx.spot.dataset.correct === "true";
        },

        handleRight: (ctx: SpotContext) => {

            // Add the tick SVG to the element and count it
            ctx.spot.insertAdjacentHTML("beforeend", RIGHT_SVG);
            ctx.game.hitCount++;
        },

        handleWrong: (ctx: SpotContext) => {

            // Add the cross SVG to the element and count it
            ctx.spot.insertAdjacentHTML("beforeend", WRONG_SVG);
            ctx.game.missCount++;
        },
    });

    spots.forEach(s => s.element.addEventListener("click", game.check));

    if (genially.isViewMode()) {
        game.start();
    }
}
