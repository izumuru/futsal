//node modules
const express = require('express')
const validator = require('express-joi-validation').createValidator({})
const Joi = require("joi");
const authentication = require('../middleware/authentication')

//local
const { addOperator } = require("../services/user.service");
const storage = require("../helpers/file_upload");


const router = express.Router()

const bodyAddOperator = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    no_hp: Joi.string().pattern(new RegExp(/^\d+$/)).min(10).max(13),
    password: Joi.string().required().min(6),
})

router.post('/add-operator', authentication, storage.fields([{name: 'thumbnail', maxCount: 1}, {name: 'ktp', maxCount: 1}]), validator.body(bodyAddOperator), addOperator)

module.exports = router