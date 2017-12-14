import Vue from 'vue'
import MaxfactorCart, { MaxfactorAccountData, MaxfactorCartData, MaxfactorCheckoutData } from '../src/index'

Vue.use(MaxfactorCart)

/* eslint-disable no-new */
new Vue({
    el: '#app',
    mixins: [
        MaxfactorAccountData,
        MaxfactorCartData,
        MaxfactorCheckoutData,
    ],
})
