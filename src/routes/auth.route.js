//node modules
const express = require('express')
const validator = require('express-joi-validation').createValidator({})
const Joi = require("joi");
const bcrypt = require('bcrypt')

//local
const {login, register, verification} = require("../services/user.service");


const router = express.Router()

//validation
const loginValidationSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
})

const registerValidationSchema  = Joi.object({
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

//router
router.post('/login', validator.body(loginValidationSchema), login)

router.post('/register', validator.body(registerValidationSchema), register)

router.get('/verification', validator.query(queryVerification), verification)

module.exports = router