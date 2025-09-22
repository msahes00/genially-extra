import * as dom from "../core/dom.ts"
import * as genially from "../core/genially.ts";

import { Container } from "../core/container.ts";
import { Game, GameContext } from "../core/game.ts";
import { Settings } from "../core/settings.ts";

const COLOR_CORRECT = "green";
const COLOR_WRONG = "red";
const ANIMATION_TIME = 1000;

/**
 * The context structure to use for the guess game.
 */
interface GuessContext extends GameContext {
    data: string;
}

genially.loadOnce(Settings.exercises.guess);
dom.init();
main();

async function main() {

    // Find the guess elements
    const area   = await Container.search(Settings.html.area);
    const guess  = await Container.search(Settings.html.guess);
    const pieces = await Container.searchAll(Settings.html.piece);

    // Parse the answer from the wrapper
    const answer = guess?.element.dataset.answer || "";

    const { verify, content } = buildArea(area!.element);

    // Build the actual game
    const game = new Game({
        updateClock: dom.updateClock,
        updateScore: dom.updateScore,
        
        isGameEnded: (ctx: GuessContext) => ctx.data === answer,
        handleEnded: dom.handleEnded(Settings.exercises.table, main),
        
        isValidPick: (ctx: GuessContext) => ctx.data === answer,
        
        handleRight: (ctx: GuessContext) => {
            
            // Prevent counting multiple hits
            if (verify.style.backgroundColor === COLOR_CORRECT) return;
            
            verify.style.backgroundColor = COLOR_CORRECT;

            ctx.game.hitCount++;
        },
        
        handleWrong: (ctx: GuessContext) => {

            const prev = verify.style.backgroundColor;
            
            ctx.game.missCount++;
            
            // Prevent multiple animations from running concurrently
            if (prev === COLOR_WRONG) return;
            
            verify.style.backgroundColor = COLOR_WRONG;
            setTimeout(
                () => verify.style.backgroundColor = prev,
                ANIMATION_TIME
            );
        },
        
        initContext: async (ctx: GuessContext) => {

            // Prepare the data atribute before the validation
            ctx.data = "";

            for (const child of Array.from(content.children)) {
                const marker = await Container.search(Settings.html.piece, {
                    root: child as HTMLElement
                });

                if (!marker) throw new Error("Marker not found");

                ctx.data += marker.element.dataset.value;
            }

            return ctx;
        },
    });

    // Wire the pieces to be able be added and removed from area
    pieces.forEach(piece => {
        const group = genially.getGroup(piece.element);
        if (!group) throw new Error("Group not found");

        group.addEventListener("click", event => moveToArea(event, game, content));
    });

    verify.addEventListener("click", game.check);

    if (genially.isViewMode()) {
        game.start();
    }
}

function moveToArea(event: Event, game: Game, content: HTMLElement) {
    if (game.gameOver) return;
  
    // Prepare to copy any grouped content
    const element = genially.getGroup(event.target as HTMLElement);
    if (!element) throw new Error("Element not found");
  
    // Clone the element and it children, and prevent absolute positioning
    const copy = element.cloneNode(true) as HTMLElement;
    copy.style.position = "relative";
  
    copy.addEventListener("click", () => {
      if (!game.gameOver) copy.remove();
    });
  
    content.appendChild(copy);
  }

function buildArea(area: HTMLDivElement) {

    // Style the area
    area.style.border = "2px solid black";
    area.style.borderRadius = "12px";
    area.style.height = "100%";
    area.style.width  = "100%";
    area.style.position = "relative";


    // Prepare the <button>
    const verify = document.createElement("button");
    verify.style.position = "absolute";
    verify.style.top = "0";
    verify.style.right = "0";
    verify.style.border = "1px solid black";
    verify.style.borderRadius = "12px";
    verify.style.padding = "10px 20px";
    verify.style.cursor = "pointer";
    verify.style.height = "100%";
    verify.style.width = "15%";
    verify.style.backgroundColor = "#f0f0f0";
    verify.style.transition = "background-color 0.2s ease";
    
    // Add some text to the button
    const text = document.createElement("p");
    text.textContent = "Comprobar";
    text.style.fontSize = "1.3rem";
    text.style.textAlign = "center";
    verify.appendChild(text);


    // Prepare the content
    const content = document.createElement("div");
    content.style.borderRadius = "12px";
    content.style.padding = "10px";
    content.style.display = "flex";
    content.style.flexDirection = "row";
    content.style.gap = "10px";
    content.style.width = "85%";
    content.style.height = "100%";
    content.style.overflow = "hidden"
    content.style.alignItems = "center";

    // Add them to the area and return them
    area.appendChild(verify);
    area.appendChild(content);

    return { verify, content };
};