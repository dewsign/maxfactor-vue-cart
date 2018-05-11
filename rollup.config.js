import RollupPluginVue from 'rollup-plugin-vue'
import RollupPluginBabel from 'rollup-plugin-babel'

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/index.js',
        format: 'es',
    },
    external: [
        'maxfactor-vue-datastore',
        'maxfactor-vue-support',
        'collect.js',
        'vue',
        'lodash',
    ],
    plugins: [
        RollupPluginVue(),
        RollupPluginBabel(),
    ],
}
