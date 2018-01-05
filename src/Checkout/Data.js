import DatastoreMixin from 'maxfactor-vue-datastore'
import {
    UserData,
    ShippingData,
    BillingData,
    DiscountData,
    ShippingMethodData,
    PaymentData,
} from '../Schema'

export default {
    mixins: [
        DatastoreMixin,
    ],
    data() {
        return {
            checkout: {
                checkouts: [],
            },
            activeCheckout: {
                user: UserData,
                shipping: ShippingData,
                shippingMethod: ShippingMethodData,
                useShipping: true,
                billing: BillingData,
                discount: DiscountData,
                payment: PaymentData,
                notes: '',
                taxApplicable: true,
                taxOptional: false,
                stage: '',
            },
            checkoutMounted: false,
            nextCheckoutStage: 0,
        }
    },

    watch: {
        shippingCountry: {
            handler(newCountry, oldCountry) {
                if (!this.countryHasChanged(newCountry, oldCountry)) return

                this.loadCountryDetails()
            },
        },
    },

    methods: {
        countryHasChanged(newCountry, oldCountry) {
            if (!newCountry) return false
            if (newCountry === oldCountry) return false

            return true
        },
    },

    /**
     * Load the checkout data using the Datastore
     */
    created() {
        this.loadData('checkout')
        this.loadData('activeCheckout')
    },
}
