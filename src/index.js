import Datastore from 'maxfactor-vue-datastore'

// Mixins
import MaxfactorAccountData from './Account/Data'
import MaxfactorAccountMixin from './Account/Mixin'
import MaxfactorCartData from './Cart/Data'
import MaxfactorCartSchema from './Schema'
import MaxfactorCartMixin from './Cart/Mixin'
import MaxfactorCheckoutData from './Checkout/Data'
import MaxfactorCheckoutMixin from './Checkout/Mixin'

export default {
    install(Vue) {
        Vue.use(Datastore)
        Vue.mixin(MaxfactorAccountMixin)
        Vue.mixin(MaxfactorCartMixin)
        Vue.mixin(MaxfactorCheckoutMixin)
    },
}

export {
    MaxfactorAccountData,
    MaxfactorCartData,
    MaxfactorCartSchema,
    MaxfactorCheckoutData,
}
