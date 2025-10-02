import * as dom from "../utils/dom.ts"
import * as random from "../utils/random.ts";
import * as genially from "../utils/genially.ts";

import * as finder from "../core/finder.ts";
import { Container } from "../core/container.ts";
import { Game, GameContext } from "../core/game.ts";
import { Settings } from "./settings.ts";

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

    const answer = await setupAnswer();
    const hitMax = setupTable(table, answer);    

    // Build the actual game
    const game = new Game({
        updateClock: dom.updateClock,
        updateScore: dom.updateScore,
        
        isGameEnded: (ctx) => ctx.game.hitCount === hitMax,
        handleEnded: dom.handleEnded(Settings.exercises.table, main),
        
        isValidPick: (ctx: TableContext) => ctx.cell.innerText === answer.txt,
        
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

async function setupAnswer() {

    // Get one answer
    const answer = random.sampleCategory(Settings.categories.color)[0];

    // Get the promt parent group
    const prompt = await Container.search(Settings.html.table);
    if (!prompt)
        throw new Error("Prompt not found");

    const group = genially.getGroup(prompt.element);
    if (!group)
        throw new Error("Group not found");

    // Find and replace the text and image
    const span = group.querySelector("span")!;
    const img  = group.querySelector("img")!;

    span.textContent = `${answer.num} = ${answer.txt}`;
    img.src = answer.src;

    // Return the answer for further use
    return answer;
}

function setupTable(table: HTMLTableElement, answer: random.Item) {

    // Count the amount of elements in the table
    const rows = table.rows.length;
    const cols = table.rows[0].cells.length;
    const total = rows * cols;
    
    // Generate a random amount of hits
    const hitCount = random.biasedInt(0, total, 0, 10);

    const data = random.sampleCategory(Settings.categories.color, {
        count: total,
        include: new Array(hitCount).fill(answer),
    });

    // Update the table contents
    data.forEach((element, i) => {
        const row = Math.floor(i / cols);
        const cell = i % cols;

        table.rows[row].cells[cell].innerText = element.txt;
    });

    return hitCount;
}
