import * as dom from "../core/dom.ts"
import * as finder from "../core/finder.ts";
import * as genially from "../core/genially.ts";

import { Container } from "../core/container.ts";
import { Game, GameContext } from "../core/game.ts";
import { Settings } from "../core/settings.ts";

const COLOR_CORRECT = "green";
const COLOR_WRONG = "red";
const ANIMATION_TIME = 1000;

/**
 * The context structure to use for the table game.
 */
interface TableContext extends GameContext {
    cell: HTMLTableCellElement;
}

genially.loadOnce(Settings.exercises.table);
dom.init();
main();

async function main() {

    // Wait until the table is loaded and initialize the game
    const elems = await finder.awaitFor("table");

    // Get the game table (assuming the first)
    const table = elems[0] as HTMLTableElement;
    if (!table)
        throw new Error("Table not found");

    // Find the script and parse the answer from it
    const answer = await getAnswer(table);

    // Compute the correct answers
    const hitMax = Array.from(table.querySelectorAll("td"))
        .filter((c) => c.innerText === answer)
        .length;


    // Build the actual game
    const game = new Game({
        updateClock: dom.updateClock,
        updateScore: dom.updateScore,
        
        isGameEnded: (ctx) => ctx.game.hitCount === hitMax,
        handleEnded: dom.handleEnded(Settings.exercises.table, main),
        
        isValidPick: (ctx: TableContext) => ctx.cell.innerText === answer,
        
        initContext: (ctx: TableContext) => {
            
            const target = ctx.event.target as HTMLElement;
            const cell = target.closest("td");
            
            if (!cell || !table.contains(cell))
                throw new Error("Invalid table cell");
            
            ctx.cell = cell;

            return ctx;
        },
        
        handleRight: (ctx: TableContext) => {
            
            // Prevent counting multiple hits
            if (ctx.cell.style.backgroundColor === COLOR_CORRECT) return;
            
            ctx.cell.style.backgroundColor = COLOR_CORRECT;

            ctx.game.hitCount++;
        },
        
        handleWrong: (ctx: TableContext) => {

            const prev = ctx.cell.style.backgroundColor;
            
            ctx.game.missCount++;
            
            // Prevent multiple animations from running concurrently
            if (prev === COLOR_WRONG) return;
            
            ctx.cell.style.backgroundColor = COLOR_WRONG;
            setTimeout(
                () => ctx.cell.style.backgroundColor = prev,
                ANIMATION_TIME
            );
        },
    });

    table.addEventListener("click", game.check);

    if (genially.isViewMode()) {
        game.start();
    }
}

async function getAnswer(table: HTMLTableElement) {

    const root = genially.getRoot(table) as HTMLElement;

    const container = await Container.search(Settings.html.table, { root });

    return container!.element.dataset.answer;
}