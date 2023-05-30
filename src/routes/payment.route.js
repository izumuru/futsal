const express = require('express')
const {validator} = require('./index')
const Joi = require("joi");
const {getPaymentMethod} = require("../services/payment.service");
const router = express.Router()

router.get('/', getPaymentMethod)

module.exports = router