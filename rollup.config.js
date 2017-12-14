import RollupPluginVue from 'rollup-plugin-vue'

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
    ],
}
