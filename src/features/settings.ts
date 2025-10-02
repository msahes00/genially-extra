import { Container } from "../core/container.ts";

/**
 * Some general settings common to most components
 */
export const Settings = {
    /**
     * The css clases used for finding the elements.
     */
    html: {
        main : "ge-main",  // The script element
        login: "ge-login", // The login text area
        next : "ge-next",  // The next button trigger
        clock: "ge-clock", // The clock widget
        score: "ge-score", // The score widget
        table: "ge-table", // The table prompt identifier
        spot : "ge-spot",
        findy: "ge-findy",
        guess: "ge-guess",
        area : "ge-area",
        piece: "ge-piece",
        obj  : "ge-obj",
        box  : "ge-box",
    } as const,
    /**
     * The exercise key to use with each exercise kind for the telemetry data.
     */
    exercises: {
        table: "table",
        spot : "spot",
        dnd  : "dnd",
        findy: "findy",
        guess: "guess",
    } as const,
    /**
     * The available categories for the images
     */
    categories: {
        black: "black",
        color: "color",
        numBlack: "num-black",
        numColor: "num-color",
        numWrong: "num-wrong",
    } as const,
    /**
     * The highlights for each element
     */
    highlights: [] as Array<{ selector: string; label: (c: Container) => string }>
};

// Define all the highlights here
Settings.highlights = [
    { selector: Settings.html.next , label: () => "Siguiente"  },
    { selector: Settings.html.clock, label: () => "Reloj"      },
    { selector: Settings.html.score, label: () => "Puntuacion" },
    { selector: Settings.html.login, label: () => "Login"      },
    { selector: Settings.html.area,  label: () => "Area"       },
    { selector: Settings.html.table, label: () => "Enunciado"  },
    {
        selector: Settings.html.main,
        label: (c: Container) => `Script "${name(c)}"`,
    },
    {
        selector: Settings.html.obj,
        label: (c: Container) => `Objeto: "${c.element.dataset.index}"`
    },
    {
        selector: Settings.html.box,
        label: (c: Container) => `Hitbox: "${c.element.dataset.index}"`
    },
    {
        selector: Settings.html.spot,
        label: (c: Container) => correct(c.element.dataset.correct),
    },
    {
        selector: Settings.html.findy,
        label: (c: Container) => `${correct(c.element.dataset.correct)} - Grupo: ${c.element.dataset.group || "##"}`
    },
    {
        selector: Settings.html.guess,
        label: (c: Container) => `Respuesta: "${c.element.dataset.answer}"`
    },
    {
        selector: Settings.html.piece,
        label: (c: Container) => `Valor: "${c.element.dataset.value}"`
    },
];

/**
 * A small helper to get a label based on the "correct" dataset property.
 */
const correct = (data: string | undefined) => data? "Correcto" : "Incorrecto";

/**
 * A small helper to get the script name and store it in the dataset.
 */
const name = (c: Container) => {

    // Store the script name if it doesn't exist
    if (!c.element.dataset.name) 
        c.element.dataset.name = c.script?.src.split("/").pop();

    return c.element.dataset.name;
};