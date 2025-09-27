import { build } from "esbuild";
import { denoPlugins } from "@oazmi/esbuild-plugin-deno";
import { copy } from "@std/fs";

const SRC_DIR = "./src/features";
const OUT_DIR = "./dist";
const PUBLIC_DIR = "./public";

const targets = [
    "login",
    "table",
    "dnd",
    "spot",
    "findy",
    "guess",
];

// Prepare the input and output paths
const paths = targets.map(target => {
    return {
        src: `${SRC_DIR}/${target}.ts`,
        out: `${OUT_DIR}/${target}.js`
    }
});

// Clean up any previous build
await Deno.remove(OUT_DIR, { recursive: true });

// Build the files
await Promise.all(
    paths.map((path) => {
        return build({
            entryPoints: [path.src],
            bundle: true,
            minify: true,
            outfile: path.out,
            platform: "browser",
            format: "iife",
            plugins: [
                // @ts-ignore: ignore weird type error
                ...denoPlugins({
                    initialPluginData: {
                        runtimePackage: "./deno.json",
                    }
                }),
            ],
        });
    })
);

// Copy public files
await copy(PUBLIC_DIR, OUT_DIR, { overwrite: true });

console.log("Build finished successfully!");
