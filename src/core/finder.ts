/**
 * Interface defining options for the waitFor and awaitFor functions.
 */
interface Options {
    timeout?: number;
    root?: HTMLElement;
}

/**
 * Waits for elements matching a CSS selector to appear in the DOM.
 * If matching elements already exist, invokes the callback synchronously.
 * Otherwise, observes DOM mutations until elements appear or the timeout is reached.
 * @param query        The CSS selector to match elements.
 * @param callback     The function to invoke with the found elements.
 * @param opts.timeout Maximum time to wait in milliseconds:  
 *                         < 0: invoke callback immediately and skip observing;  
 *                         = 0: wait indefinitely until elements appear;  
 *                         > 0: wait up to this time before giving up.  
 * @param opts.root    The root element to query and observe. Defaults to `document.documentElement`.
 */
export const waitFor = (
    query: string,
    callback: (elements: Element[]) => void,
    opts: Options = {},
) => {
    const {
        timeout = 0,
        root = document.documentElement
    } = opts;


    // Check if the element is already available
    const elements = root.querySelectorAll(query);

    if (elements.length > 0 || timeout < 0) {
        callback(Array.from(elements));
        return;
    }


    // Otherwise, start observing the root until the element is found
    const observer = new MutationObserver((_mutations) => {

        const elements = root.querySelectorAll(query);
        if (elements.length == 0) return;

        callback(Array.from(elements));
        observer.disconnect();
    });

    // Kickstart the timeout if possible
    if (timeout > 0) {
        setInterval(() => {
            const elements = root.querySelectorAll(query);
            callback(Array.from(elements));
            observer.disconnect();
        }, timeout);
    }

    observer.observe(root, { childList: true, subtree: true });
}

/**
 * Asynchronous version of waitFor that returns a Promise.
 * @see {@link waitFor}
 *
 * @returns A Promise with the results of waitFor.
 */
export const awaitFor = (
    query: string,
    opts: Options = {}
): Promise<Element[]> => {
    return new Promise((resolve) => {
        waitFor(query, resolve, opts);
    });
}