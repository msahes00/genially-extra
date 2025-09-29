import * as dom from "../utils/dom.ts";
import * as genially from "../utils/genially.ts";
import * as telemetry from "../utils/telemetry.ts";
import { Container } from "../core/container.ts";
import { Settings } from "./settings.ts";

genially.loadOnce("login");
dom.init();
main();


async function main() {

    const container = await Container.search(Settings.html.login);
    if (!container) throw new Error("Login container not found");;

    // Prepare the <input type="text">
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Tu codigo...";

    // And style it
    input.style.boxSizing = "border-box";
    input.style.width = "100%";
    input.style.padding = "0.5em 1em";
    input.style.marginTop = "0.5em";
    input.style.border = "1px solid #ccc";
    input.style.borderRadius = "4px";

    input.style.fontSize = "1rem";
    input.style.textAlign = "center";

    input.value = telemetry.getUser();
    input.addEventListener("input", () => {
        telemetry.login(input.value);
    });

    container.element.replaceChildren(input);

    // Wait until it it is not present to search for the login again
    const timeout = 100;
    while (await Container.search(Settings.html.login, { timeout })) {
        await new Promise(resolve => setTimeout(resolve, timeout));
    }

    main();
}