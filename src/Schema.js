export const ShippingData = {
    firstname: '',
    surname: '',
    company: '',
    address: '',
    address_2: '',
    address_3: '',
    address_city: '',
    address_county: '',
    address_postcode: '',
    address_country: '',
}

export const BillingData = {
    nameoncard: '',
    firstname: '',
    surname: '',
    company: '',
    address: '',
    address_2: '',
    address_3: '',
    address_city: '',
    address_county: '',
    address_postcode: '',
    address_country: '',
}

export const UserData = {
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
    address_county: '',
    address_postcode: '',
    address_country: '',
    vat_number: '',
    newsletter: '',
    optout: '',
    terms: false,
    shipping: ShippingData,
    billing: BillingData,
}

export const DiscountData = {
    code: '',
    description: '',
    expiry: '',
    percentage: 0.00,
}

export const ShippingMethodData = {
    id: 0,
    name: '',
    price: 0.00,
    taxRate: 0.00,
    poa: false,
}

export const PaymentData = {
    token: {},
    result: {},
}

export const CountryData = {
    countryCode: 'GB',
    taxApplicable: true,
}

export const CheckoutStages = {
    DEFAULT: 1,
    SHIPPING: 2,
    PAYMENT: 3,
    COMPLETE: 4,
}

export default {
    UserData,
    ShippingData,
    BillingData,
    DiscountData,
    ShippingMethodData,
    PaymentData,
    CountryData,
    CheckoutStages,
}
