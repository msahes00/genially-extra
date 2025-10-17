import { Container } from "../core/container.ts";
import { Settings } from "../settings.ts";
import * as genially from "./genially.ts";


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

/**
 * Start the game and restart it as soon as its not currently in the screen
 * @param main The game entrypoint
 */
export const enqueue = async (main: () => void) => {

        // Run the entrypoint
        main();

        // Find the main script container and add a nonce to it
        const script = await Container.search(Settings.html.main);
        if (!script)
            throw new Error("Main script not found");
    
        const nonce = "nonce-" + Date.now();
        script.element.dataset.nonce = nonce;
    
        // Poll for the nonce to change and restart the game
        const interval = setInterval(async () => {
            const container = await Container.search(Settings.html.main, { timeout: -1 });
            
            if (container?.element.dataset.nonce !== nonce) {
                enqueue(main);
                clearInterval(interval);
            }
        }, 100);
};