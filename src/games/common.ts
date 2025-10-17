
import * as telemetry from "../utils/telemetry.ts"
import { Timer } from "../core/timer.ts";
import { Container } from "../core/container.ts";
import { Game, GameContext } from "../core/game.ts";
import { Settings } from "../settings.ts";

/**
 * The telemetry key for the game.data store.
 */
export const ENDED_KEY = "telemetry";

/**
 * Handle the end of the game by sending telemetry with the correct key
 * @param ctx The game context to get the telemetry type from.
 */
export const handleEnded = async (ctx: GameContext) => {

    const wrapper = await Container.search(Settings.html.next);
    if (!wrapper)
        throw new Error("Wrapper not found");

    // Delay the click for a bit, as genially may randomly ignore the click otherwise
    setTimeout(() => wrapper.element.click(), 100);

    // Get the telemetry key
    const type = ctx.game.data[ENDED_KEY] as string;
    if (!type)
        throw new Error("Telemetry type not found");

    telemetry.send(ctx.game, type);
};

/**
 * Update the clock display with the elapsed time.
 * @param timer The timer instance to get the elapsed time from.
 */
export const updateClock = async (timer: Timer) => {
    const container = await Container.search(Settings.html.clock);
    if (!container)
        throw new Error("Clock not found");

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
    if (!container)
        throw new Error("Score not found");

    const score = `
        Aciertos: ${game.hitCount}
        Errores: ${game.missCount}
    `;

    container.element.style.fontSize = "1.25rem";

    container.element.replaceChildren(score);
};

/**
 * A combined strategy with the clock, score and ended handlers.
 */
export const combined = {
    updateClock,
    updateScore,
    handleEnded,
};