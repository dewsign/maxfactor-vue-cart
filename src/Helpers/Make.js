class Make {
    static cloneOf(object) {
        return JSON.parse(JSON.stringify(object))
    }

    static ucFirst(value) {
        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    }

    static money(amount) {
        if (amount <= 0) return parseFloat(amount).toFixed(2)
        return parseFloat(amount)
    }
}

export default Make
