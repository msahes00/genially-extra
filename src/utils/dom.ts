import { Settings } from "../features/settings.ts";
import * as telemetry from "./telemetry.ts"
import * as genially from "./genially.ts";

import { Timer } from "../core/timer.ts";
import { Container } from "../core/container.ts";
import { Game, GameContext } from "../core/game.ts";


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

    const date = new Date(totalSeconds * 1000);

    const clock = date.toISOString().slice(14, 19);

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

    // Skip highlighting if we are viewing the genially
    if (genially.isViewMode()) return;

    // Keep searching indefinitely for elements and highlight them
    while (true) {

        Settings.highlights.forEach(async ({selector, label}) => {
            const containers = await Container.searchAll(selector, {timeout});
            containers.forEach(
                (c: Container) => c.highlight(label(c))
            );
        });
    
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, timeout));
    }
};