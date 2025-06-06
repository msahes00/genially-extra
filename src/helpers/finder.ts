// Define a magic name to identify the container
export const MAGIC_STRING = 'genially-tricks';

/**
 * Finds the enclosing <div> element with the magic string as its class.
 */
export const getScriptDiv = () => {
    return document.querySelector(`div.${MAGIC_STRING}`);
};

/**
 * Finds the <script> element contained within a magic div container.
 */
export const getScript = () => {

    const container = getScriptDiv();

    return container?.querySelector('script');
};
