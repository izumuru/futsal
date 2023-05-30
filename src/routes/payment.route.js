const express = require('express')
const {validator} = require('./index')
const Joi = require("joi");
const {getPaymentMethod, getTutorialPayment} = require("../services/payment.service");
const router = express.Router()

const params = Joi.object({
    payment_method_id: Joi.number().required()
})

const query = Joi.object({
    virtual_account: Joi.string().required(),
    biller_code: Joi.string()
})

router.get('/', getPaymentMethod)
router.get('/tutorial/:payment_method_id', validator.params(params), validator.query(query), getTutorialPayment)

module.exports = router