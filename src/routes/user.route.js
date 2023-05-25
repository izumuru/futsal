//node modules
const express = require('express')
const validator = require('express-joi-validation').createValidator({})
const Joi = require("joi");
const bcrypt = require('bcrypt')

//local
const {login} = require("../services/user.service");


const router = express.Router()

//validation
const loginValidationSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
})

const registerValidationSchema  = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    no_hp: Joi.string().regex('/^[0-9]+$/').min(10).max(13),
    password: Joi.string().required().min(6),
    confirm_password: Joi.ref('password'),
    fcm_token: Joi.string().required()
})

//router
router.post('/login', validator.query(loginValidationSchema), login)

router.post('/register', validator.query(registerValidationSchema), register)

module.exports = router