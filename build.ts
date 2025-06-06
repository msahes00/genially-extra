import { build } from 'npm:esbuild';


const SRC_DIR = './src';
const OUT_DIR = './dist';

const targets = [
    'table',
];

// Prepare the input and output paths
const paths = targets.map(name => {
    return {
        src: `${SRC_DIR}/${name}.ts`,
        out: `${OUT_DIR}/${name}.js`
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
            platform: 'browser',
            format: 'iife',
        });
    })
);