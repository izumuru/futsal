const {PaymentMethod, InstructionPaymentMethod} = require('../models')

async function getPaymentMethod(request, response) {
    const paymentMethods = await PaymentMethod.findAll();
    return response.status(200).json({
        status: 200,
        data: paymentMethods.map(value => {
            if (value.platform_payment_method === 'web' || value.payment_method_id === 5) return;
            return {
                payment_method_id: value.payment_method_id,
                payment_method_name: value.payment_method_name,
                logo: process.env.APP_URL + '/' + value.logo,
                payment_admin_percent: value.payment_admin_percent === null ? undefined : value.payment_admin_percent,
                payment_admin_nominal: value.payment_admin_nominal === null ? undefined : value.payment_admin_nominal
            }
        }).filter(value => value !== undefined)
    });
}

async function getTutorialPayment(request, response) {
    const {payment_method_id} = request.params
    const {virtual_account, biller_code} = request.query
    const paymentMethods = await PaymentMethod.findOne({where:{payment_method_id},
        include: {
            model: InstructionPaymentMethod,
        }
    })
    if(paymentMethods.payment_method_name === 'Mandiri' && !biller_code) return response.status(400).json({status: 400, errors: [
        '"biller_code" required'
        ]})
    return response.status(200).json({
        status: 200,
        data: paymentMethods.InstructionPaymentMethods.map(value => {
            if(paymentMethods.payment_method_name === "Mandiri") {
                return {
                    type_payment_method: value.dataValues.type_payment_method,
                    instruction_payment_method_description: value.dataValues.instruction_payment_method_descriptio
                        .replace('<code>', `**${virtual_account}**`).replace('<biller_code>', `**${biller_code}**`)
                }
            } else {
                return {
                    type_payment_method: value.dataValues.type_payment_method,
                    instruction_payment_method_description: value.dataValues.instruction_payment_method_descriptio.replace('<code>', `**${virtual_account}**`)
                }
            }
        })
    })
}

module.exports = {getPaymentMethod, getTutorialPayment}