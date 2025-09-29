// Declare the custom property
declare global {
    interface Window {
        __extraGenially: Record<string, boolean>;
    }
}

/**
 * Check if an extra Genially script with the given key has already been loaded.
 * If not, it marks the script as loaded.
 * @param key A unique identifier for the script.
 */
export const loadOnce = (key: string) => {
    
    if (!globalThis.window.__extraGenially) {
        globalThis.window.__extraGenially = {};
    }
    
    if (globalThis.window.__extraGenially[key]) 
        throw new Error(`Extra Genially script with key '${key}' is already loaded`);

    globalThis.window.__extraGenially[key] = true;
};

/**
 * Check if the Genially page is in view mode.
 * @returns True if in view mode, false otherwise.
 */
export const isViewMode = () => location.href.includes("view.genially.com");

/**
 * Finds the root element of a Genially slide wrapper based on a target element.
 * @param target The element to start searching from.
 * @returns      The root element, or null if not found.
 */
export const getRoot = (target: HTMLElement) => target.closest(".genially-view-slide-wrapper-transform");

/**
 * Finds the Genially group element based on an target element.
 * @param target The element to start searching from.
 * @returns      The group element, or null if not found.
 */
export const getGroup = (target: HTMLElement) => target.closest(".genially-view-absolute");