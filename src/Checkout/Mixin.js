import { FormMixin } from 'maxfactor-vue-support'
import collect from 'collect.js'
import Make from '../Helpers/Make'
import Tell from '../Helpers/Tell'
import { CheckoutStages as Stage } from '../Schema'

export default {
    data() {
        return {
            action: '',
            waitingForResult: false,
            showMobileCheckoutSummary: false,
        }
    },

    mixins: [
        FormMixin,
    ],

    computed: {
        /**
         * Global reference to all checkouts. Each checkout should be
         * self-contained to allow someone to pay for a quotation or postage
         * charge from the CMS, without this affecting their basket.
         */
        checkoutCollections() {
            return collect(this.$root.checkout.checkouts)
        },

        /**
         * The currentCheckout object should be used for all checkout relted
         * functionality as this is linked to stored checkouts and makes it
         * easy to switch between them.
         */
        currentCheckout: {
            get() {
                return this.$root.activeCheckout
            },
            set(value) {
                this.$root.activeCheckout = value
            },
        },

        /**
         * Quickly access to the payment section
         */
        payment() {
            return this.currentCheckout.payment
        },

        hasMounted: {
            get() {
                return this.$root.checkoutMounted
            },
            set(value) {
                this.$root.checkoutMounted = value
            },
        },

        /**
         * Gather billing details from the form and format as stripe object
         */
        stripeData() {
            return {
                name: this.currentCheckout.billing.nameoncard,
                address_line1: this.currentCheckout.billing.address,
                address_line2: this.currentCheckout.billing.address_2 || '',
                address_city: this.currentCheckout.billing.address_city,
                address_state: this.currentCheckout.billing.county || '',
                address_zip: this.currentCheckout.billing.address_postcode,
                address_country: this.currentCheckout.billing.address_country || '',
            }
        },

        hasPaymentErrors() {
            return collect(this.currentCheckout.payment.error).contains('code')
        },

        hasPaymentToken() {
            return collect(this.currentCheckout.payment.token).contains('id')
        },

        shippingCountry() {
            return this.currentCheckout.shipping.address_country
        },

        useShippingForBilling() {
            return this.currentCheckout.useShipping
        },

        taxChargable() {
            if (!this.currentCheckout.taxApplicable) {
                return false
            }
            if (this.currentCheckout.taxOptional && this.currentCheckout.user.vat_number) {
                return false
            }

            return true
        },

        customCheckoutItems() {
            return Tell.serverVariable('customCheckoutItems')
        },

        /**
         * Determine if the current checkout is custom or regular cart
         */
        isCustomCheckout() {
            const checkoutId = Tell.serverVariable('uid')

            if (!checkoutId) return false
            if (!window.location.href.indexOf(checkoutId)) return false
            if (this.activeCartCollection.uid === checkoutId) return false

            return true
        },

        /**
         * Helper to determine if the user can edit the shipping address during
         * the checkout process.
         */
        canEditShipping() {
            return !this.isCustomCheckout
        },

        nextStage: {
            get() {
                return this.$root.nextCheckoutStage
            },
            set(stage) {
                this.$root.nextCheckoutStage = stage
            },
        },

        suppliedUid() {
            return Tell.serverVariable('uid')
        },

        suppliedBillingAddress() {
            return Tell.serverVariable(`checkout.billing.${this.suppliedUid}`)
        },

        billingIsEmpty() {
            if (this.currentCheckout.billing.surname) return false
            if (this.currentCheckout.billing.address) return false
            if (this.currentCheckout.billing.address_postcode) return false
            if (this.currentCheckout.billing.address_country) return false

            return true
        },

    },

    watch: {
        payment: {
            handler() {
                if (!this.waitingForResult) {
                    this.formIsLoading = false
                    return
                }

                if (this.hasPaymentErrors) {
                    this.formIsLoading = false
                    return
                }

                if (!this.hasPaymentToken) {
                    this.formIsLoading = false
                    return
                }

                this.submitCheckoutToServer()
            },
            deep: true,
        },

        useShippingForBilling(newValue) {
            if (newValue === true) {
                this.syncShippingToBilling()
                return
            }

            if (this.isCustomCheckout && this.billingIsEmpty) {
                if (this.suppliedBillingAddress) {
                    this.currentCheckout.billing = this.suppliedBillingAddress
                }

                return
            }

            if (!this.isCustomCheckout) this.clearBillingAddress()
        },

        customCheckoutItems(items) {
            this.log(items)
        },

    },

    methods: {
        syncShippingItemToBilling(item) {
            this.currentCheckout.billing[item] = this.currentCheckout.shipping[item]
        },

        clearBillingItem(item) {
            this.currentCheckout.billing[item] = ''
        },

        syncShippingToBilling() {
            collect([
                'firstname',
                'surname',
                'company',
                'telephone',
                'address',
                'address_2',
                'address_3',
                'address_city',
                'address_postcode',
                'address_county',
                'address_country',
                'address_notes',
            ]).map(item => this.syncShippingItemToBilling(item))
        },

        clearBillingAddress() {
            collect([
                'firstname',
                'surname',
                'company',
                'telephone',
                'address',
                'address_2',
                'address_3',
                'address_city',
                'address_postcode',
                'address_county',
                'address_country',
                'address_notes',
            ]).map(item => this.clearBillingItem(item))
        },

        /**
         * Get the content of a specific checkout
         *
         * @param {string} id
         */
        checkoutCollection(id = null) {
            const checkoutId = id || Tell.serverVariable('checkoutId', '')

            return this.checkoutCollections.where('uid', checkoutId)
        },

        /**
         * Creates a new checkout with a cloned set of data
         * (e.g. the current cart)
         *
         * @param {string} id
         * @param {object} data
         */
        createCheckout(id, data) {
            const newCheckoutData = Make.cloneOf(data)
            if (!this.checkoutCollection(id).count()) {
                if (this.isLoggedIn) newCheckoutData.user = Make.cloneOf(this.userData)
                this.checkoutCollections.push(newCheckoutData)
            } else {
                this.replaceCheckout(id, newCheckoutData)
            }
        },

        /**
         * The the current checkout from one of the available checkouts
         * @param {string} id
         */
        setActiveCheckout(id, force = false) {
            if (
                this.currentCheckout.uid === this.checkoutCollection(id).first().uid &&
                !force
            ) {
                return
            }

            this.currentCheckout = this.checkoutCollection(id).first()
        },

        /**
         * Replace the items in the existing checkout with the new items passed
         * in from the data. Does not replace any other details (as the user
         * might already have started the checkout process and we don't want to
         * replace this data.)
         *
         * @param {string} id
         * @param {object} data
         */
        replaceCheckout(id, data) {
            if (this.currentCheckout.uid !== id) return

            this.currentCheckout.items = Make.cloneOf(data.items)
            this.currentCheckout.notes = Make.cloneOf(data.notes)
            this.checkoutCollection(id).first().items = Make.cloneOf(data.items)
        },

        /**
         * Ensures the checkout data exists and the url includes the checkout id
         *
         * @param {*} event
         * @param {string} id
         */
        prepareCheckout(event, id = null) {
            this.formIsLoading = true
            this.action = event.target.dataset.url

            const checkoutId = id || Tell.serverVariable('uid') || this.activeCartCollection.uid

            if (checkoutId === this.activeCartCollection.uid) {
                this.createCheckout(checkoutId, this.activeCartCollection)
            } else if (!this.checkoutCollection(checkoutId).count()) {
                const newCart = Make.cloneOf(this.activeCartCollection)

                newCart.items = Tell.serverVariable('customCheckoutItems')

                this.createCheckout(checkoutId, newCart)
            }

            this.setActiveCheckout(checkoutId)

            /**
             * Sync the shipping address of the active checkout to the billing adress
             */
            if (this.useShippingForBilling) this.syncShippingToBilling()

            this.submitCheckoutToServer()
        },

        /**
         * Process checkout ready to submit to server
         *
         */
        processCheckout(event) {
            this.action = event.target.getAttribute('data-url')
            this.formIsLoading = true

            if (this.currentCheckout.payment.provider === 'free' || this.currentCheckout.payment.provider === 'paypal') {
                this.submitCheckoutToServer()
            } else {
                /**
                 * Client-side process the checkout and get a stripe token. See the watch
                 * section for the 'payment' watch which acts as a callback when stripe
                 * has returned a token or error.
                 */
                this.currentCheckout.payment.error = {}
                this.waitingForResult = true
                this.emit('createToken', this.stripeData)
            }
        },

        /**
         * Load items from server variables
         *
         * @param {string} checkoutId
         */
        updateItems(checkoutId) {
            /**
             *  Don't update front end cart items on first stage if user has cart with checkoutId
             *  This allows users to edit items once checkout started
             */
            if (this.currentCheckout.stage && window.location.href.indexOf(checkoutId) > -1) {
                return
            }

            if (Tell.serverVariable(`checkout.${checkoutId}`)) {
                this.currentCheckout.items = Tell.serverVariable(`checkout.${checkoutId}`)
            }
        },

        /**
         * Load user details from server variables
         *
         * @param {string} checkoutId
         */
        updateUserDetails(checkoutId) {
            if (Tell.serverVariable(`checkout.user.${checkoutId}`)) {
                this.currentCheckout.user = Tell.serverVariable(`checkout.user.${checkoutId}`)
            }
        },

        /**
         * Load and user details from server variables
         *
         * @param {string} checkoutId
         */
        updateBillingDetails(checkoutId) {
            if (Tell.serverVariable(`checkout.billing.${checkoutId}`)) {
                this.currentCheckout.billing = Tell.serverVariable(`checkout.billing.${checkoutId}`)
            }
        },

        /**
         * Load and user details from server variables
         *
         * @param {string} checkoutId
         */
        updateShippingDetails(checkoutId) {
            if (Tell.serverVariable(`checkout.shipping.${checkoutId}`)) {
                this.currentCheckout.shipping = Tell.serverVariable(`checkout.shipping.${checkoutId}`)
            }
        },

        /**
         * Load and activate custom checkout if accessed and available
         */
        loadCustomCheckout(checkoutId) {
            if (Tell.serverVariable(`paypal.${checkoutId}`)) {
                this.currentCheckout.payment = Tell.serverVariable(`paypal.${checkoutId}`)
            }

            if (this.checkoutCollection(checkoutId).count()) {
                if (window.location.href.indexOf(checkoutId) > -1) {
                    this.setActiveCheckout(checkoutId)
                }

                this.updateItems(checkoutId)
                this.updateUserDetails(checkoutId)
                this.updateBillingDetails(checkoutId)
                this.updateShippingDetails(checkoutId)

                this.activeCartCollection = Make.cloneOf(this.currentCheckout)

                return
            }

            const newCart = Make.cloneOf(this.activeCartCollection)

            newCart.uid = checkoutId
            newCart.useShipping = false
            newCart.items = Tell.serverVariable(`checkout.${checkoutId}`)
            newCart.shipping = Tell.serverVariable(`checkout.shipping.${checkoutId}`)
            newCart.billing = Tell.serverVariable(`checkout.billing.${checkoutId}`)
            newCart.user = Tell.serverVariable(`checkout.user.${checkoutId}`)

            this.activeCartCollection = newCart

            this.createCheckout(checkoutId, newCart)

            if (window.location.href.indexOf(checkoutId) <= -1) return

            this.setActiveCheckout(checkoutId)
            this.loadCountryDetails()
        },

        /**
         * All client side work is done, pass everything to the server to
         * validate and process
         */
        submitCheckoutToServer() {
            if (!this.action) {
                this.formIsLoading = false
                return
            }

            const checkoutUrl = this.action.replace('UUID', this.currentCheckout.uid)

            this.errors = {}

            this.postForm(checkoutUrl, {
                stripe: this.payment,
                checkout: this.currentCheckout,
            }).then((response) => {
                if (!response) {
                    this.errors = {
                        message: 'No response',
                    }
                    this.formIsLoading = false
                    return
                }

                /**
                 * If this isn't a payment process continue to next stage
                 */
                if (!response.data.paymentResponse) {
                    this.continueCheckout()
                    return
                }

                if (response.data.paymentResponse.error) {
                    this.errors = response.data.paymentResponse.error
                    return
                }

                if (response.data.paymentResponse.status === 'succeeded') {
                    this.currentCheckout.payment.result = response.data
                    this.continueCheckout()
                }
            }).catch((error) => {
                this.formIsLoading = false
                this.errors = error.response.data
            })
        },

        /**
         * Navigate to the next stage of the checkout process
         *
         * @param {string?} id
         */
        continueCheckout(id = null) {
            const checkoutId = id || this.currentCheckout.uid
            if (!this.action) {
                this.formIsLoading = false
                return
            }

            const checkoutUrl = this.action.replace('UUID', checkoutId)
            if (checkoutUrl === window.location.href) {
                this.formIsLoading = false
                return
            }

            this.progressCheckoutStage()

            this.action = ''

            /**
             * We set the loading state to true before making a client side redirect to avoid the
             * user clicking the submit button multiple times
             */
            this.formIsLoading = true
            window.location.href = checkoutUrl
        },

        /**
         * Toggle checkout order summary section
         * on mobile and tablet devices.
         */
        toggleMobileCheckoutSummary() {
            this.showMobileCheckoutSummary = !this.showMobileCheckoutSummary
        },

        setCheckoutStage(stage = null) {
            if (!stage) return

            const stageMethod = `setCheckoutStage${Make.ucFirst(stage)}`
            if (typeof this[stageMethod] === 'function') this[stageMethod]()
        },

        /**
         * Clear up after a paypal checkout has been completed. Called when the page
         * first loads.
         */
        setCheckoutStagePaypalcomplete() {
            this.setCheckoutStageComplete()
        },

        /**
         * Clear up after a checkout has been completed. Called when the page
         * first loads.
         */
        setCheckoutStageComplete() {
            if (this.handleInvalidCheckout(Stage.COMPLETE)) return

            this.currentCheckout.stage = Stage.COMPLETE

            if (this.activeCartCollection.uid === this.currentCheckout.uid) this.deleteCart()
        },

        /**
         * Prepare the third checkout stage (payment details). Called when the
         * page first loads.
         */
        setCheckoutStagePayment() {
            if (this.handleInvalidCheckout(Stage.PAYMENT)) return

            this.prepareNextStage(Stage.PAYMENT, Stage.COMPLETE)
        },

        /**
         * Prepare the second checkout stage for shipping method. Called when the
         * page first loads.
         */
        setCheckoutStageShipping() {
            if (this.handleInvalidCheckout(Stage.SHIPPING)) return

            this.prepareNextStage(Stage.SHIPPING, Stage.PAYMENT)
        },

        /**
         * Prepare the first checkout stage. Called when the page first loads.
         */
        setCheckoutStageDefault() {
            if (this.handleInvalidCheckout(Stage.DEFAULT)) return

            this.prepareNextStage(Stage.DEFAULT, Stage.SHIPPING)
        },

        /**
         * Delete items from the cart and give it a new ID
         */
        deleteCart() {
            this.activeCartCollection.items = []
            this.activeCartCollection.uid = Tell.randomUid()
            this.activeCartCollection.discount = {
                code: '',
                description: '',
                expiry: '',
                percentage: 0.00,
            }
        },

        progressCheckoutStage() {
            if (!this.currentCheckout.stage) this.currentCheckout.stage = 0

            if (this.currentCheckout.stage < Stage.COMPLETE && this.nextStage) {
                this.currentCheckout.stage = this.nextStage
            }
        },

        /**
         * Set the current checkout stage (only if moving forward) and prepare
         * the next stage to allow the user to move forward.
         */
        prepareNextStage(stageFrom, stageTo) {
            this.nextStage = stageTo

            if (this.currentCheckout.stage < stageFrom) this.currentCheckout.stage = stageFrom
        },

        /**
         * Check that the current checkout step is allowed to be accessed.
         * Returns false if the stage is valid.
         */
        handleInvalidCheckout(checkoutView = Stage.DEFAULT) {
            if (!this.currentCheckout.stage) return false

            if (this.currentCheckout.stage === checkoutView) return false

            if (this.currentCheckout.stage >= checkoutView &&
                this.currentCheckout.stage <= Stage.COMPLETE) return false

            /**
             * We set the loading state to true before making a client side redirect here to stop
             * the user from performing further actions.
             */
            this.formIsLoading = true
            window.location.href = '/cart'

            return true
        },

        loadCountryDetails() {
            if (!this.shippingCountry) return

            this.formIsLoading = true

            this.postForm('/account/location', {
                country: this.shippingCountry,
            }).then((response) => {
                this.formIsLoading = false

                if (response.data.errors) {
                    this.errors = response.data.errors
                }

                if (response.data.countryCode && this.currentCheckout.stage < Stage.SHIPPING) {
                    this.currentCheckout.taxApplicable = response.data.taxApplicable
                    this.currentCheckout.taxOptional = response.data.taxOptional
                    this.currentCheckout.shippingMethod = {
                        id: 0,
                        name: '',
                        price: 0.00,
                        taxRate: 0.00,
                        poa: false,
                    }
                }
            }).catch((error) => {
                this.formIsLoading = false
                this.errors = error
            })
        },

    },

    /**
     * Load custom checkout items if required
     */
    mounted() {
        if (this.hasMounted) return

        this.hasMounted = true

        const uid = Tell.serverVariable('uid')

        if (!uid) return

        this.loadCustomCheckout(uid)

        const stage = Tell.serverVariable(`stage.${uid}`)
        if (stage) this.setCheckoutStage(stage)
    },

}
