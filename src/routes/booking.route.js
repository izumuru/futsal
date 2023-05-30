const express = require('express')
const {validator} = require('./index')
const Joi = require("joi");
const router = express.Router()
const opadmin = require('../middleware/opadmin.authorization')
const {createWebBooking, getAvailableTime, getBookingGroupByField, getDetailBooking, createMobileBooking} = require('../services/booking.service')

const bodyCreateBooking = Joi.object({
    field_id: Joi.number().required(),
    booking_date: Joi.date().required(),
    booking_time: Joi.string().required(),
    duration : Joi.number().min(1).required().max(5)
})

const bodyCreateBookingMobile = Joi.object({
    field_id: Joi.number().required(),
    booking_date: Joi.date().required(),
    booking_time: Joi.string().required(),
    duration : Joi.number().min(1).required().max(5),
    payment_method_id: Joi.number().required()
})

const paramsField = Joi.object({
    field_id: Joi.number().required(),
})
const paramsId = Joi.object({
    booking_id: Joi.number().required()
})
const querySchema = Joi.object({
    date: Joi.date().required()
})

router.get('/field/:field_id', validator.params(paramsField), validator.query(querySchema), getAvailableTime)
router.post('/mobile', validator.body(bodyCreateBookingMobile), createMobileBooking)

router.use(opadmin)
router.get('/fields', validator.query(querySchema), getBookingGroupByField)
router.get('/:booking_id', validator.params(paramsId), getDetailBooking)
router.post('/', validator.body(bodyCreateBooking), createWebBooking)

module.exports = router