export default {
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
            this.userData = {}
            this.isLoggedIn = false
        },

        formFieldValid(element) {
            return this.formError(element) ? 'true' : 'false'
        },
    },
}
