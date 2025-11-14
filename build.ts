import { build } from "esbuild";
import { copy, emptyDir } from "@std/fs";
import { denoPlugins } from "@oazmi/esbuild-plugin-deno";

const SRC_DIR = "./src/entrypoints";
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

async function main() {
    await cleanup();
    await checkTypes();
    await buildTargets();
    await copyPublicFiles();

    console.log("Build finished successfully!");
}

async function cleanup() {
    console.log("Cleaning up previous build...");
    await emptyDir(OUT_DIR);
}

async function checkTypes() {
    console.log("Checking types...");
    const entryPoints = targets.map(target => `${SRC_DIR}/${target}.ts`);
    await runCommand("deno", ["check", ...entryPoints]);
}

async function buildTargets() {
    console.log("Building targets...");

    const entryPoints = targets.map(target => `${SRC_DIR}/${target}.ts`);
    
    await build({
        entryPoints,
        bundle: true,
        minify: true,
        outdir: OUT_DIR,
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
}

async function copyPublicFiles() {
    console.log("Copying public files...");
    await copy(PUBLIC_DIR, OUT_DIR, { overwrite: true });
}

async function runCommand(cmd: string, args: string[]) {
    const command = new Deno.Command(cmd, {
        args,
        stdout: "inherit",
        stderr: "inherit",
    });

    const process = command.spawn();
    const status = await process.status;

    if (!status.success) {
        console.error(`Command failed: ${cmd} ${args.join(" ")}`);
        Deno.exit(1);
    }
}

if (import.meta.main) {
    main();
}
