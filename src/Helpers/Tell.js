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

export default Tell
