import { build } from "esbuild";
import { denoPlugins } from "@luca/esbuild-deno-loader";

const SRC_DIR = "./src/features";
const OUT_DIR = "./dist";

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
                ...denoPlugins(),
            ],
        });
    })
);