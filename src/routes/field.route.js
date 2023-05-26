//node modules
const express = require('express')
const validator = require('express-joi-validation').createValidator({})
const Joi = require("joi");
const multer = require('multer')
//local
const storage = require("../helpers/file_upload");
const authorization = require('../middleware/')
const { addField } = require("../services/field.service");


const router = express.Router()

const bodyAddOperator = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    no_hp: Joi.string().pattern(new RegExp(/^\d+$/)).min(10).max(13),
    password: Joi.string().required().min(6),
    address: Joi.string().required()
})
const updloadImage = storage.fields([
    {name: 'fieldImages', maxCount: 5}
])
router.use(authorization)
router.post('/fields', (req, res, next) => {
    updloadImage(req, res, (err) => {
        if(err instanceof multer.MulterError) {
            console.log(err)
            res.status(400).json({
                status: 400,
                message: 'Upload gambar gagal'
            })
        } else if(err) {
            console.log(err)
            res.status(500).json({
                status: 500,
                message: 'Internal server error'
            })
        } else {
            next()
        }
    })
}, validator.body(bodyAddOperator), addOperator)

module.exports = router