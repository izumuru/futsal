const {PaymentMethod} = require('../models')

async function getPaymentMethod(request, response) {
    const paymentMethods = await PaymentMethod.findAll();
    return response.status(200).json(paymentMethods.map(value => {
        if (value.platform_payment_method === 'web') return;
        return {
            payment_method_id: value.payment_method_id,
            payment_method_name: value.payment_method_name,
            logo: process.env.APP_URL + '/' + value.logo,
            payment_admin_percent: value.payment_admin_percent === null ? undefined : value.payment_admin_percent,
            payment_admin_nominal: value.payment_admin_nominal === null ? undefined : value.payment_admin_nominal
        }
    }).filter(value => value !== undefined));
}

module.exports = {getPaymentMethod}