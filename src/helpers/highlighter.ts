import { getScriptDiv } from "./finder.ts";

/**
 * Highlights a given element by adding a red border and some padding.
 * It will only highlight the elements on the editor
 */
export const highlight = (element: HTMLElement, name: string) => {

    if (location.href.includes("view.genially")) return;

    element.style.border = "2px solid red";
    element.style.padding = "2px";
    element.style.height = "100%";
    element.style.width = "100%";

    element.appendChild(document.createTextNode(name));
}

/**
 * Highlights the current script tag in the page by adding a border.
 * Useful for finding where the script is located in the page.
 */
export const highlightScript = (name: string) => {
    highlight(getScriptDiv() as HTMLDivElement, name);
}