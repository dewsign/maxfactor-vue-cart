import collect from 'collect.js'
import Make from '../Helpers/Make'

export default {
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
                this.$root.account.userData = value
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
            this.userData = user
            this.setCheckoutDefaults()
            this.isLoggedIn = true
        },

        /**
         * Set the user state to logged out and clear the userData
         */
        logout() {
            this.userData = {}
            this.isLoggedIn = false
        },

        /**
         * Pre-fill the shipping address from the account address
         */
        setCheckoutDefaults() {
            if (this.currentCheckout && this.currentCheckout.shipping !== {}) {
                this.currentCheckout.user = collect(Make.cloneOf(this.userData)).except(['error', 'token']).all()
            }
        },
    },

    /**
     * Listen for Login and Logout events in order to set or clear stored account
     * data and state.
     */
    mounted() {
        this.$root.$on('login', this.login)
        this.$root.$on('logout', this.logout)
    },

}
