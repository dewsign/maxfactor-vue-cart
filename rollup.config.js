import RollupPluginVue from 'rollup-plugin-vue'
import RollupPluginBabel from 'rollup-plugin-babel'

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/index.js',
        format: 'cjs',
    },
    external: [
        'maxfactor-vue-datastore',
        'maxfactor-vue-eventhandler',
        'collect.js',
        'vue',
    ],
    plugins: [
        RollupPluginVue(),
        RollupPluginBabel(),
    ],
}
