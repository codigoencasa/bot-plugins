import typescript from 'rollup-plugin-typescript2'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'

export default {
    input: ['src/index.ts'],
    output: [
        {
            dir: 'dist',
            entryFileNames: '[name].cjs',
            format: 'cjs',
            exports: 'named',
            chunkFileNames: '[name].cjs',
        },
    ],
    plugins: [
        json(),
        commonjs({
            ignoreDynamicRequires: true
        }),
        nodeResolve({
            resolveOnly: (module) => !/ffmpeg|@bot-whatsapp\/bot|openai|sharp/i.test(module),
        }),
        typescript(),
    ],
}
