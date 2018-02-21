import collect from 'collect.js'
import Make from '../Helpers/Make'

export default {
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

            if (this.cartCollection.discount.percentage === '100.00') {
                this.currentCheckout.payment = { provider: 'free' }
            } else {
                this.currentCheckout.payment = { provider: '' }
            }

            return parseFloat(this.cartCollection.discount.percentage)
        },

        cartDiscountTotal() {
            if (!this.cartCollection.discount.percentage) return 0.00

            return Make.money(this.cartNetTotal * (this.cartDiscountPercentage / 100.0))
        },

        cartSubTotal() {
            const totalItemsIncTax = this.itemsCollection.sum(item =>
                this.taxTotal(item.quantity * item.unitPrice *
                    (1.00 - (this.cartDiscountPercentage / 100.0)), item.taxRate))

            return Make.money(totalItemsIncTax + parseFloat(this.cartShippingTotal(true)))
        },

        cartTaxTotal() {
            return Make.money(this.cartSubTotal -
                (this.cartNetTotal - this.cartDiscountTotal))
        },

        taxShouldApply() {
            return this.taxCanApply && this.activeCartCollection.taxInclusive
        },

        /**
         * Determine if tax can be charged in the shopper's location. Default to true when no
         * location services are included
         */
        taxCanApply() {
            if (this.isTaxableLocation === undefined) return true

            return this.isTaxableLocation
        },

        taxRate() {
            return this.activeCartCollection.taxRate
        },

        activeCartCollection: {
            get() {
                return this.$root.cart
            },
            set(value) {
                this.$root.cart = value
            },
        },

        /**
         * Helper method to return the full cart object as a Collection
         */
        cartCollection: {
            get() {
                if (window.location.href.indexOf(this.currentCheckout.uid) > -1
                    && this.currentCheckout.uid) {
                    return this.currentCheckout
                }

                return this.activeCartCollection
            },
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
            })

            return itemInCart.count() ? itemInCart.first() : null
        },

        /**
         * Removes an item from the cart.
         *
         * @param {Object} item
         */
        deleteItemInCart(item) {
            const findItem = this.isItemInCart(item)
            if (!findItem) return

            this.emit('removeditemfromcart', item)

            this.activeCartCollection.items = this.itemsCollection.filter(cartItem =>
                JSON.stringify(cartItem) !== JSON.stringify(findItem)).all()
        },

        cartShippingTotal(includeTax = false) {
            if (!includeTax) return this.shippingMethodCollection.price || 0.00

            return Make.money(this.taxTotal(
                this.shippingMethodCollection.price,
                this.shippingMethodCollection.taxRate,
                true,
            ) || 0.00)
        },

        /**
         * Increase the quantity of an item in the cart by a specific number,
         * up-to a maximum as specified in the cart data quanityMax
         *
         * @param {Object} item
         * @param {number} amount
         */
        increaseQuantity(item, amount = 1) {
            const itemInCart = this.isItemInCart(item)
            if (!itemInCart) return

            if (itemInCart.quantity < itemInCart.quantityMax) itemInCart.quantity += amount
        },

        /**
         * Decrease the quantity of an item in the cart by a specific number.
         * Removes the item from the cart if the quantity is less than quanityMin
         *
         * @param {Object} item
         * @param {number} amount
         */
        decreaseQuantity(item, amount = 1, forceQuantityMin = null) {
            const itemInCart = this.isItemInCart(item)
            if (!itemInCart) return

            itemInCart.quantity -= amount

            if (itemInCart.quantity.valueOf() < forceQuantityMin || itemInCart.quantityMin) {
                this.removeItemFromCart(item)
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
            const itemInCart = this.isItemInCart(item)
            if (!itemInCart) return

            if (amount < itemInCart.quantityMin) this.removeItemFromCart(item)

            itemInCart.quantity = amount > itemInCart.quantityMax ? itemInCart.quantityMax : amount
        },

        /**
         * Add an item to the cart or increase its quantity if the item is
         * already in the cart by the new quantity amount
         *
         * @param {Object} item
         */
        addItemToCart(item) {
            const itemInCart = this.isItemInCart(item)

            if (itemInCart) {
                this.increaseQuantity(item, item.quantity)
                return
            }

            this.itemsCollection.push(item)
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
            const taxRate = (rate !== null) ? rate : this.taxRate

            if (window.location.href.includes('/checkout/') && this.taxChargable) {
                return Make.money(parseFloat(amount) + (parseFloat(amount) * taxRate))
            }

            if (this.taxCanApply && (inclusive || this.taxShouldApply) && !window.location.href.includes('/checkout/')) {
                return Make.money(parseFloat(amount) + (parseFloat(amount) * taxRate))
            }

            return Make.money(amount)
        },
    },
}
