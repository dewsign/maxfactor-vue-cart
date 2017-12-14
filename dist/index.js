'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var DatastoreMixin = _interopDefault(require('maxfactor-vue-datastore'));
var collect = _interopDefault(require('collect.js'));

const ShippingData = {
    firstname: '',
    surname: '',
    company: '',
    address: '',
    address_2: '',
    address_3: '',
    address_city: '',
    address_postcode: '',
    address_country: '',
};

const BillingData = {
    nameoncard: '',
    firstname: '',
    surname: '',
    company: '',
    address: '',
    address_2: '',
    address_3: '',
    address_city: '',
    address_postcode: '',
    address_country: '',
};

const UserData = {
    id: '',
    email: '',
    firstname: '',
    surname: '',
    company: '',
    telephone: '',
    address: '',
    address_2: '',
    address_3: '',
    address_city: '',
    address_postcode: '',
    address_country: '',
    vat_number: '',
    newsletter: '',
    optout: '',
    terms: false,
    shipping: ShippingData,
    billing: BillingData,
};

const DiscountData = {
    code: '',
    description: '',
    expiry: '',
    percentage: 0.00,
};

const ShippingMethodData = {
    id: 0,
    name: '',
    price: 0.00,
    taxRate: 0.00,
    poa: false,
};

const PaymentData = {
    token: {},
    result: {},
};

const CountryData = {
    countryCode: 'GB',
    taxApplicable: true,
};

const CheckoutStages = {
    DEFAULT: 1,
    SHIPPING: 2,
    PAYMENT: 3,
    COMPLETE: 4,
};

var Schema = {
    UserData,
    ShippingData,
    BillingData,
    DiscountData,
    ShippingMethodData,
    PaymentData,
    CountryData,
    CheckoutStages,
};

var Data = {
    mixins: [
        DatastoreMixin,
    ],

    data() {
        return {
            account: {
                loggedIn: false,
                userData: UserData,
            },
        }
    },

    /**
     * Load the account data using the Datastore
     */
    mounted() {
        this.loadData('account');
    },
};

class Make {
    static cloneOf(object) {
        return JSON.parse(JSON.stringify(object))
    }

    static ucFirst(value) {
        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    }

    static money(amount) {
        return parseFloat(amount)
    }
}

var MaxfactorAccountMixin = {
    computed: {
        /**
         * User object containing the currently logged in user details. This is
         * accessible application wide.
         */
        userData: {
            get() {
                return this.$root.account.userData
            },
            set(value) {
                this.$root.account.userData = value;
            },
        },
    },

    methods: {
        /**
         * Set the user state to logged in and assign the userData
         *
         * @param {Object} user
         */
        login(user) {
            this.userData = user;
            this.setCheckoutDefaults();
            this.isLoggedIn = true;
        },

        /**
         * Set the user state to logged out and clear the userData
         */
        logout() {
            this.userData = {};
            this.isLoggedIn = false;
        },

        /**
         * Pre-fill the shipping address from the account address
         */
        setCheckoutDefaults() {
            if (this.currentCheckout && this.currentCheckout.shipping !== {}) {
                this.currentCheckout.user = collect(Make.cloneOf(this.userData)).except(['error', 'token']).all();
            }
        },
    },

    /**
     * Listen for Login and Logout events in order to set or clear stored account
     * data and state.
     */
    mounted() {
        this.$root.$on('login', this.login);
        this.$root.$on('logout', this.logout);
    },

};

var Data$1 = {
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
        this.loadData('cart');
    },
};

var MaxfactorCartMixin = {
    computed: {
        /**
         * Return the number of items in the current Cart
         */
        itemsInCart() {
            return this.itemsCollection.sum('quantity')
        },

        /**
         * Get the total amount for all items in the cart
         */
        cartNetTotal() {
            return Make.money(this.itemsCollection.sum(item =>
                item.quantity * item.unitPrice))
        },

        cartDiscountPercentage() {
            if (!this.cartCollection.discount.percentage) return 0.00

            return parseFloat(this.cartCollection.discount.percentage)
        },

        cartDiscountTotal() {
            if (!this.cartCollection.discount.percentage) return 0.00

            return Make.money(this.cartNetTotal * (this.cartDiscountPercentage / 100.0))
        },

        cartSubTotal() {
            const totalItemsIncTax = this.itemsCollection.sum(item =>
                this.taxTotal(item.quantity * item.unitPrice *
                    (1.00 - (this.cartDiscountPercentage / 100.0)), item.taxRate));

            return Make.money(totalItemsIncTax + parseFloat(this.cartShippingTotal(true)))
        },

        cartTaxTotal() {
            return Make.money(this.cartSubTotal -
                (this.cartNetTotal - this.cartDiscountTotal))
        },

        activeCartCollection() {
            return this.$root.cart
        },

        /**
         * Helper method to return the full cart object as a Collection
         */
        cartCollection() {
            if (window.location.href.indexOf(this.currentCheckout.uid) > -1
                && this.currentCheckout.uid) {
                return this.currentCheckout
            }

            return this.activeCartCollection
        },

        shippingCollection() {
            return this.cartCollection.shipping
        },

        shippingMethodCollection() {
            return this.cartCollection.shippingMethod
        },

        billingCollection() {
            return this.cartCollection.billing
        },

        /**
         * Helper method to return the items in cart as a Collection object.
         * Uses either the current Checkout or the default Cart.
         */
        itemsCollection() {
            return collect(this.cartCollection.items)
        },

        isCartShippingPoa() {
            return this.shippingMethodCollection.poa
        },
    },
    methods: {
        /**
         * Determine if an item is already in the cart. Returns the collection
         * object of the item if it is found.
         *
         * @param {Object} item
         */
        isItemInCart(item) {
            const itemInCart = this.itemsCollection.filter((cartItem) => {
                if (cartItem.id !== item.id) return false
                if (cartItem.name !== item.name) return false
                if (JSON.stringify(cartItem).options !== JSON.stringify(item).options) return false
                if (cartItem.unitPrice !== item.unitPrice) return false

                return true
            });

            return itemInCart.count() ? itemInCart.first() : null
        },

        /**
         * Removes an item from the cart.
         *
         * @param {Object} item
         */
        deleteItemInCart(item) {
            const findItem = this.isItemInCart(item);

            this.emit('removeditemfromcart', item);

            this.cart.items = this.itemsCollection.filter(cartItem =>
                JSON.stringify(cartItem) !== JSON.stringify(findItem)).all();
        },

        cartShippingTotal(includeTax = false) {
            if (!includeTax) return this.shippingMethodCollection.price || 0.00

            return this.taxTotal(
                this.shippingMethodCollection.price,
                this.shippingMethodCollection.taxRate,
                true,
            ) || 0.00
        },

        /**
         * Increase the quantity of an item in the cart by a specific number,
         * up-to a maximum as specified in the cart data quanityMax
         *
         * @param {Object} item
         * @param {number} amount
         */
        increaseQuantity(item, amount = 1) {
            const itemInCart = this.isItemInCart(item);
            if (!itemInCart) return

            if (itemInCart.quantity < itemInCart.quantityMax) itemInCart.quantity += amount;
        },

        /**
         * Decrease the quantity of an item in the cart by a specific number.
         * Removes the item from the cart if the quantity is less than quanityMin
         *
         * @param {Object} item
         * @param {number} amount
         */
        decreaseQuantity(item, amount = 1) {
            const itemInCart = this.isItemInCart(item);
            if (!itemInCart) return

            itemInCart.quantity -= amount;

            if (itemInCart.quantity.valueOf() < itemInCart.quantityMin) {
                this.removeItemFromCart(item);
            }
        },

        /**
         * Updates the quantity of an item in the cart to a specific number.
         * Removes the item from the cart if the quantity is less than quanityMin
         * and doesn't allow a quantity greater than the quantityMax.
         *
         * @param {Object} item
         * @param {number} amount
         */
        updateQuantity(item, amount) {
            const itemInCart = this.isItemInCart(item);
            if (!itemInCart) return

            if (amount < itemInCart.quantityMin) this.removeItemFromCart(item);

            itemInCart.quantity = amount > itemInCart.quantityMax ? itemInCart.quantityMax : amount;
        },

        /**
         * Add an item to the cart or increase its quantity if the item is
         * already in the cart by the new quantity amount
         *
         * @param {Object} item
         */
        addItemToCart(item) {
            const itemInCart = this.isItemInCart(item);

            if (itemInCart) {
                this.increaseQuantity(item, item.quantity);
                return
            }

            this.itemsCollection.push(item);
        },

        /**
         * Remove an item from the cart completely
         *
         * @param {Object} item
         */
        removeItemFromCart(item) {
            return this.deleteItemInCart(item)
        },

        taxTotal(amount, rate = null, inclusive = null) {
            const taxRate = rate || this.taxRate;

            if (window.location.href.includes('/checkout/') && this.taxChargable) {
                return parseFloat(amount) + (parseFloat(amount) * taxRate)
            }

            if (this.taxCanApply && (inclusive || this.taxShouldApply) && !window.location.href.includes('/checkout/')) {
                return parseFloat(amount) + (parseFloat(amount) * taxRate)
            }

            return amount
        },
    },
};

var Data$2 = {
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

                this.loadCountryDetails();
            },
        },
    },

    methods: {
        countryHasChanged(newCountry, oldCountry) {
            if (!newCountry || !oldCountry) return false
            if (newCountry === oldCountry) return false

            return true
        },
    },

    /**
     * Load the checkout data using the Datastore
     */
    created() {
        this.loadData('checkout');
        this.loadData('activeCheckout');
    },
};

class Tell {
    static inMoney(amount) {
        return parseFloat(amount)
            .toLocaleString('en-GB', {
                useGrouping: true,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })
    }

    /**
     * Generates a new "Random" ID to use as the cart/checkout Id.
     * TODO: Reduce length of id to around 10-12?
     */
    static randomUid() {
        return Math.random().toString(36).slice(2)
    }

    static serverVariable(variableKey, defaultValue = null) {
        if (!window.server_variables) return defaultValue

        return window.server_variables[variableKey] || defaultValue
    }
}

var FormMixin = {
    computed: {
        formHasErrors() {
            return this.errors
        },
    },

    methods: {
        formError(field) {
            if (!this.errors) return false

            if (typeof this.errors[field] === 'string') return this.errors[field]
            if (typeof this.errors[field] === 'undefined') return ''

            return this.errors[field][0]
        },

        logout() {
            this.userData = {};
            this.isLoggedIn = false;
        },

        formFieldValid(element) {
            return this.formError(element) ? 'true' : 'false'
        },
    },
};

var MaxfactorCheckoutMixin = {
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
                this.$root.activeCheckout = value;
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
                this.$root.checkoutMounted = value;
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
            const checkoutId = Tell.serverVariable('uid');

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
                this.$root.nextCheckoutStage = stage;
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
                if (!this.waitingForResult) return

                this.loading = true;

                if (this.hasPaymentErrors) return

                if (!this.hasPaymentToken) return

                this.submitCheckoutToServer();
            },
            deep: true,
        },

        useShippingForBilling(newValue) {
            if (newValue === true) {
                this.syncShippingToBilling();
                return
            }

            if (this.isCustomCheckout && this.billingIsEmpty) {
                if (this.suppliedBillingAddress) {
                    this.currentCheckout.billing = this.suppliedBillingAddress;
                }

                return
            }

            if (!this.isCustomCheckout) this.clearBillingAddress();
        },

        customCheckoutItems(items) {
            this.log(items);
        },

    },

    methods: {
        syncShippingItemToBilling(item) {
            this.currentCheckout.billing[item] = this.currentCheckout.shipping[item];
        },

        clearBillingItem(item) {
            this.currentCheckout.billing[item] = '';
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
                'address_country',
            ]).map(item => this.syncShippingItemToBilling(item));
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
                'address_country',
            ]).map(item => this.clearBillingItem(item));
        },

        /**
         * Get the content of a specific checkout
         *
         * @param {string} id
         */
        checkoutCollection(id = null) {
            const checkoutId = id || Tell.serverVariable('checkoutId', '');

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
            const newCheckoutData = Make.cloneOf(data);
            if (!this.checkoutCollection(id).count()) {
                if (this.isLoggedIn) newCheckoutData.user = Make.cloneOf(this.userData);
                this.checkoutCollections.push(newCheckoutData);
            } else {
                this.replaceCheckout(id, newCheckoutData);
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

            this.currentCheckout = this.checkoutCollection(id).first();
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

            this.currentCheckout.items = Make.cloneOf(data.items);
            this.currentCheckout.notes = Make.cloneOf(data.notes);
            this.checkoutCollection(id).first().items = Make.cloneOf(data.items);
        },

        /**
         * Ensures the checkout data exists and the url includes the checkout id
         *
         * @param {*} event
         * @param {string} id
         */
        prepareCheckout(event, id = null) {
            this.action = event.target.href;
            const checkoutId = id || Tell.serverVariable('uid') || this.activeCartCollection.uid;

            if (checkoutId === this.activeCartCollection.uid) {
                this.createCheckout(checkoutId, this.activeCartCollection);
            } else if (!this.checkoutCollection(checkoutId).count()) {
                const newCart = Make.cloneOf(this.activeCartCollection);

                newCart.items = Tell.serverVariable('customCheckoutItems');

                this.createCheckout(checkoutId, newCart);
            }

            this.setActiveCheckout(checkoutId);

            /**
             * Sync the shipping address of the active checkout to the billing adress
             */
            if (this.useShippingForBilling) this.syncShippingToBilling();

            this.submitCheckoutToServer();
        },

        /**
         * Client-side process the checkout and get a stripe token. See the watch
         * section for the 'payment' watch which acts as a callback when stripe
         * has returned a token or error.
         */
        processCheckout(event) {
            this.action = event.target.href;
            this.currentCheckout.payment.error = {};
            this.waitingForResult = true;
            this.emit('createToken', this.stripeData);
        },

        /**
         * Load and activate custom checkout if accessed and available
         */
        loadCustomCheckout(checkoutId) {
            if (this.checkoutCollection(checkoutId).count()) {
                if (window.location.href.indexOf(checkoutId) > -1) {
                    this.setActiveCheckout(checkoutId);
                }

                return
            }

            const newCart = Make.cloneOf(this.activeCartCollection);

            newCart.uid = checkoutId;
            newCart.useShipping = false;
            newCart.items = Tell.serverVariable(`checkout.${checkoutId}`);
            newCart.shipping = Tell.serverVariable(`checkout.shipping.${checkoutId}`);
            newCart.billing = Tell.serverVariable(`checkout.billing.${checkoutId}`);
            newCart.user = Tell.serverVariable(`checkout.user.${checkoutId}`);

            this.createCheckout(checkoutId, newCart);

            if (window.location.href.indexOf(checkoutId) <= -1) return

            this.setActiveCheckout(checkoutId);
            this.loadCountryDetails();
        },

        /**
         * All client side work is done, pass everything to the server to
         * validate and process
         */
        submitCheckoutToServer() {
            if (!this.action) return

            const checkoutUrl = this.action.replace('UUID', this.currentCheckout.uid);

            this.errors = {};

            window.axios.post(checkoutUrl, {
                stripe: this.payment,
                checkout: this.currentCheckout,
            }).then((response) => {
                this.loading = false;

                if (!response) {
                    this.errors = {
                        message: 'No response',
                    };
                    return
                }

                /**
                 * If this isn't a payment process continue to next stage
                 */
                if (!response.data.paymentResponse) {
                    this.continueCheckout();
                    return
                }

                if (response.data.paymentResponse.error) {
                    this.errors = response.data.paymentResponse.error;
                    return
                }

                if (response.data.paymentResponse.status === 'succeeded') {
                    this.currentCheckout.payment.result = response.data;
                    this.continueCheckout();
                }
            }).catch((error) => {
                this.loading = false;
                this.errors = error.response.data;
            });
        },

        /**
         * Navigate to the next stage of the checkout process
         *
         * @param {string?} id
         */
        continueCheckout(id = null) {
            const checkoutId = id || this.currentCheckout.uid;
            if (!this.action) return

            const checkoutUrl = this.action.replace('UUID', checkoutId);
            if (checkoutUrl === window.location.href) return

            this.progressCheckoutStage();

            this.action = '';
            this.loading = false;
            window.location.href = checkoutUrl;
        },

        /**
         * Toggle checkout order summary section
         * on mobile and tablet devices.
         */
        toggleMobileCheckoutSummary() {
            this.showMobileCheckoutSummary = !this.showMobileCheckoutSummary;
        },

        setCheckoutStage(stage = null) {
            if (!stage) return

            const stageMethod = `setCheckoutStage${Make.ucFirst(stage)}`;
            if (typeof this[stageMethod] === 'function') this[stageMethod]();
        },

        /**
         * Clear up after a checkout has been completed. Called when the page
         * first loads.
         */
        setCheckoutStageComplete() {
            if (this.handleInvalidCheckout(CheckoutStages.COMPLETE)) return

            this.currentCheckout.stage = CheckoutStages.COMPLETE;

            if (this.activeCartCollection.uid === this.currentCheckout.uid) this.deleteCart();
        },

        /**
         * Prepare the third checkout stage (payment details). Called when the
         * page first loads.
         */
        setCheckoutStagePayment() {
            if (this.handleInvalidCheckout(CheckoutStages.PAYMENT)) return

            this.prepareNextStage(CheckoutStages.PAYMENT, CheckoutStages.COMPLETE);
        },

        /**
         * Prepare the second checkout stage for shipping method. Called when the
         * page first loads.
         */
        setCheckoutStageShipping() {
            if (this.handleInvalidCheckout(CheckoutStages.SHIPPING)) return

            this.prepareNextStage(CheckoutStages.SHIPPING, CheckoutStages.PAYMENT);
        },

        /**
         * Prepare the first checkout stage. Called when the page first loads.
         */
        setCheckoutStageDefault() {
            if (this.handleInvalidCheckout(CheckoutStages.DEFAULT)) return

            this.prepareNextStage(CheckoutStages.DEFAULT, CheckoutStages.SHIPPING);
        },

        /**
         * Delete items from the cart and give it a new ID
         */
        deleteCart() {
            this.activeCartCollection.items = [];
            this.activeCartCollection.uid = Tell.randomUid();
        },

        progressCheckoutStage() {
            if (!this.currentCheckout.stage) this.currentCheckout.stage = 0;

            if (this.currentCheckout.stage < CheckoutStages.COMPLETE && this.nextStage) {
                this.currentCheckout.stage = this.nextStage;
            }
        },

        /**
         * Set the current checkout stage (only if moving forward) and prepare
         * the next stage to allow the user to move forward.
         */
        prepareNextStage(stageFrom, stageTo) {
            this.nextStage = stageTo;

            if (this.currentCheckout.stage < stageFrom) this.currentCheckout.stage = stageFrom;
        },

        /**
         * Check that the current checkout step is allowed to be accessed.
         * Returns false if the stage is valid.
         */
        handleInvalidCheckout(checkoutView = CheckoutStages.DEFAULT) {
            if (!this.currentCheckout.stage) return false

            if (this.currentCheckout.stage === checkoutView) return false

            if (this.currentCheckout.stage >= checkoutView &&
                this.currentCheckout.stage < CheckoutStages.COMPLETE) return false

            window.location.href = '/cart';
            return true
        },

        loadCountryDetails() {
            if (!this.shippingCountry) return

            this.loading = true;

            window.axios.post('/account/location', {
                country: this.shippingCountry,
            }).then((response) => {
                this.loading = false;

                if (response.data.errors) {
                    this.errors = response.data.errors;
                }

                if (response.data.countryCode) {
                    this.currentCheckout.taxApplicable = response.data.taxApplicable;
                    this.currentCheckout.taxOptional = response.data.taxOptional;
                    this.currentCheckout.shippingMethod = {
                        id: 0,
                        name: '',
                        price: 0.00,
                        taxRate: 0.00,
                        poa: false,
                    };
                }
            }).catch((error) => {
                this.loading = false;
                this.errors = error;
            });
        },

    },

    /**
     * Load custom checkout items if required
     */
    mounted() {
        if (this.hasMounted) return

        this.hasMounted = true;

        const uid = Tell.serverVariable('uid');

        if (!uid) return

        this.loadCustomCheckout(uid);

        const stage = Tell.serverVariable(`stage.${uid}`);
        if (stage) this.setCheckoutStage(stage);
    },

};

var ComponentCartTest = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('a',[_c('svg',{staticClass:"header__icon",attrs:{"xmlns":"http://www.w3.org/2000/svg","width":"22.1","height":"21.8","viewBox":"0 0 22.1 21.8","role":"img","aria-label":"Cart"}},[_c('path',{attrs:{"d":"M926.6,136.8v1c0,.2-.4,5.2-.6,6.3a3.6,3.6,0,0,1-3.3,2.9l-9.2,1.1v-1.9l9-1.1a1.7,1.7,0,0,0,1.7-1.3c.1-.7.3-3.2.5-5.1H911.2v9.7a1.1,1.1,0,0,0,1.2,1.1h12.6v1.9H912.4a3,3,0,0,1-3.1-3V137.8a1.4,1.4,0,0,0-1.4-1.3h-3.5v-1.9h3.5a3.3,3.3,0,0,1,3.1,2.3Zm-13.5,17.6a1.9,1.9,0,1,1-1.9-1.9A1.9,1.9,0,0,1,913.1,154.5Zm12,0a1.9,1.9,0,1,1-1.9-1.9A1.9,1.9,0,0,1,925.1,154.5Z","transform":"translate(-904.4 -134.6)"}})]),_vm._v(" "),_c('span',[_vm._v(_vm._s(_vm.getCount))])])},staticRenderFns: [],
    props: [
        'count',
    ],
    computed: {
        getCount() {
            return this.count
        },
    },
};

// Mixins
// Components
var index = {
    install(Vue) {
        Vue.use(DatastoreMixin);
        Vue.mixin(MaxfactorAccountMixin);
        Vue.mixin(MaxfactorCartMixin);
        Vue.mixin(MaxfactorCheckoutMixin);
        Vue.component('cart-test', ComponentCartTest);
    },
};

exports['default'] = index;
exports.MaxfactorAccountData = Data;
exports.MaxfactorCartData = Data$1;
exports.MaxfactorCartSchema = Schema;
exports.MaxfactorCheckoutData = Data$2;
