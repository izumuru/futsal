//node modules
const {validator} = require('./index')
const express = require('express')

const Joi = require("joi");
const router = express.Router()
//local
const {login, register, verification, sendForgotPasswordOtp, forgotPassword} = require("../services/user.service");


//validation
const loginValidationSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    fcm_token: Joi.string()
})
const registerValidationSchema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    no_hp: Joi.string().pattern(new RegExp(/^\d+$/)).min(10).max(13),
    password: Joi.string().required().min(6),
    confirm_password: Joi.ref('password'),
    fcm_token: Joi.string().required()
})
const queryVerification = Joi.object({
    token: Joi.string().min(3).required()
})
const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
    code: Joi.string().pattern(new RegExp(/^\d+$/)).required(),
    password: Joi.string().required().min(6),
    confirm_password: Joi.ref('password'),
})
const sendOtp = Joi.object({
    email: Joi.string().email().required()
})

//router
router.post('/login', validator.body(loginValidationSchema), login)
router.post('/register', validator.body(registerValidationSchema), register)
router.get('/verification', validator.query(queryVerification), verification)
router.post('/otp-forgot-password', validator.body(sendOtp), sendForgotPasswordOtp)
router.put('/forgot-password', validator.body(forgotPasswordSchema), forgotPassword)

module.exports = router