import { Settings } from "./settings.ts";
import * as telemetry from "./telemetry.ts"

import { Timer } from "./timer.ts";
import { Container } from "./container.ts";
import { Game, GameContext } from "./game.ts";


/**
 * Handle the end of the game by sending telemetry and triggering the next action.
 * @param type The type of the telemetry event.
 * @param main The function to call to restart the game.
 */
export const handleEnded = (type: string, main: () => void) => {
    
    return async (ctx: GameContext) => {
        // The timeout between checks for the next element
        const timeout = 10;

        const wrapper = await Container.search(Settings.html.next);

        // Delay the click for a bit, as genially may randomly ignore the click otherwise
        setTimeout(() => wrapper?.element.click(), 100);

        telemetry.send(ctx.game, type);

        // Wait until the next element is removed (not in the game screen anymore)
        while (await Container.search(Settings.html.next, {timeout})) {
            await new Promise(resolve => setTimeout(resolve, timeout));
        }

        // Start the game again
        main();
    };
};

/**
 * Update the clock display with the elapsed time.
 * @param timer The timer instance to get the elapsed time from.
 */
export const updateClock = async (timer: Timer) => {
    const container = await Container.search(Settings.html.clock);
    if (!container) return;

    const totalSeconds = timer.getElapsedSeconds();

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);

    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(seconds).padStart(2, "0");

    const clock = `${formattedMinutes}:${formattedSeconds}`;

    container.element.style.fontSize = "1.5rem";

    container.element.replaceChildren(clock);
};

/**
 * Update the score display.
 * @param game The game instance to get the score from.
 */
export const updateScore = async (game: Game) => {
    const container = await Container.search(Settings.html.score);
    if (!container) return;

    const score = `
        Aciertos: ${game.hitCount}
        Errores: ${game.missCount}
    `;

    container.element.style.fontSize = "1.25rem";

    container?.element.replaceChildren(score);
};


/**
 * Search and highlight all container elements found. Retry periodically.
 */
export const init = async () => {
    const timeout = 1000;

    // Declare some inmutable elements
    const textHighlights = [
        { selector: Settings.html.next , label: "Siguiente"  },
        { selector: Settings.html.clock, label: "Reloj"      },
        { selector: Settings.html.score, label: "Puntuacion" },
    ];
    
    // Declare some state dependent elements
    const fnHighlights = [
        {
            selector: Settings.html.main,
            labelFn: (c: Container) => {
                // Store the name of the script in the dataset
                if (!c.element.dataset.name) 
                    c.element.dataset.name = c.script?.src.split("/").pop();

                return `Script "${c.element.dataset.name}"`;
            }
        },
        {
            selector: Settings.html.table,
            labelFn: (c: Container) => `Respuesta: "${c.element.dataset.answer}"`
        },
        {
            selector: Settings.html.obj,
            labelFn: (c: Container) => `Objeto: "${c.element.dataset.index}"`
        },
        {
            selector: Settings.html.box,
            labelFn: (c: Container) => `Hitbox: "${c.element.dataset.index}"`
        },
        {
            selector: Settings.html.spot,
            labelFn: (c: Container) => c.element.dataset.correct === "true" ? "Correcto" : "Incorrecto"
        },
    ];
    

    // Keep searching indefinitely for elements and highlight them
    while (true) {

        textHighlights.forEach(async ({selector, label}) => {
            const container = await Container.search(selector, {timeout});
            container?.highlight(label);
        });

        fnHighlights.forEach(async ({selector, labelFn}) => {
            const containers = await Container.searchAll(selector, {timeout});
            containers.forEach(
                (c: Container) => c.highlight(labelFn(c))
            );
        });
    
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, timeout));
    }
};