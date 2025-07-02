import * as finder from "./finder.ts";
import * as genially from "./genially.ts";

/**
 * The magic string used to identify the container element.
 */
export const MAGIC_STRING = "genially-extra";

/**
 * The magic CSS query used to search the container element.
 */
export const MAGIC_QUERY = `div.${MAGIC_STRING}`;

/**
 * Represents an HTML container element and provides access to its contents.
 */
export class Container {

    /**
     * The container div element with the magic string class, or null if not found.
     */
    public readonly element: HTMLDivElement;

    /**
     * The id used to find this container.
     */
    public readonly id: string | null;

    /**
     * The script element found within the container, or null if not found.
     */
    public readonly script: HTMLScriptElement | null;

    /**
     * Searches for a container, resolving to the first one found.
     * @see {@link searchAll}
     */
    static async search(
        ...args: Parameters<typeof this.searchAll>
    ): Promise<Container | null> {
        const containers = await this.searchAll(...args);
        return containers[0] ?? null;
    }
   
    /**
     * Searches for all matching containers. The arguments after `id` are passed directly to finder.awaitFor.
     * @see {@link finder.awaitFor}
     * 
     * @param id The id used to build the selector; pass null to match any id.
     * @returns  A promise resolving to an array of container instances (never null).
     */
    static async searchAll(
        id: string | null,
        ...args: Parameters<typeof finder.awaitFor> extends [unknown, ...infer R]? R : never
    ): Promise<Container[]> {
        
        const query = MAGIC_QUERY + (id ? `.${id}` : "");

        const divs = await finder.awaitFor(query, ...args);
        
        return divs.map(div => new Container(id, div as HTMLDivElement));
    }

    private constructor(id: string | null, element: HTMLDivElement) {
        this.id = id;
        this.element = element;
        this.script = this.element?.querySelector("script") ?? null;
    }

    /**
     * Highlights the container with the provided text content.
     * @param text The text content to highlight. Can be a string or a function.
     * @returns    The container instance for chaining.
     */
    public highlight(text: string | ((c: Container) => string)) {

        // Do not highlight the container when viewing the Genially
        if (genially.isViewMode()) return;

        this.element.style.border  = "2px solid red";
        this.element.style.padding = "2px";
        this.element.style.height  = "100%";
        this.element.style.width   = "100%";

        this.element.style.alignItems     = "center";
        this.element.style.justifyContent = "center";
        this.element.style.textAlign      = "center";


        if (typeof text === "function")
            this.element.replaceChildren(text(this));
        else
            this.element.replaceChildren(text);

        return this;
    }
}