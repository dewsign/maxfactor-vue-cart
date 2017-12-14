import {
    UserData,
    ShippingData,
    BillingData,
    DiscountData,
    ShippingMethodData,
    PaymentData,
} from '../Schema'

export default {
    data() {
        return {
            cart: {
                uid: this.generateUid(),

                /**
                 * Cart default values to be appended to any item which is missing
                 * any of the values
                 */
                taxRate: 0.2,
                quantityMin: 1,
                quantityMax: 100,

                taxApplicable: true,
                taxOptional: false,
                taxInclusive: true,

                useShipping: true,

                user: UserData,
                shipping: ShippingData,
                shippingMethod: ShippingMethodData,
                billing: BillingData,
                discount: DiscountData,
                payment: PaymentData,

                /**
                 * List of items in the current Cart
                 */
                items: [],

                notes: '',

                stage: '',
            },
        }
    },

    methods: {
        generateUid() {
            return Math.random().toString(36).slice(2)
        },
    },

    /**
     * Load the cart data using the Datastore
     */
    created() {
        this.loadData('cart')
    },
}
