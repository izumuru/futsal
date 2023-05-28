const {router, validator} = require('./index')
const Joi = require("joi");

const opadmin = require('../middleware/opadmin.authorization')
const {createWebBooking} = require('../services/booking.service')

const bodyCreateBooking = Joi.object({
    field_id: Joi.number().required(),
    booking_date: Joi.date().required(),
    booking_time: Joi.string().required(),
    duration : Joi.number().min(1).required().max(5)
})

router.use(opadmin)
router.post('/', validator.body(bodyCreateBooking), createWebBooking)