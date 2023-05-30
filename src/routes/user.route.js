//node modules
const express = require('express')

const {validator } = require('./index')
const router = express.Router()
const Joi = require("joi");
const adminAuthorization = require('../middleware/admin.authorization')

//local
const { addOperator, detailOperator, setOperatorStatus, updateOperator, getOperator, } = require("../services/operator.service");
const storage = require("../helpers/file_upload");
const {multerWithErrorHandling} = require("../helpers/erorr_handling");
const {getUserProfile, updateUser} = require("../services/user.service");

const bodyAddOperator = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    no_hp: Joi.string().pattern(new RegExp(/^\d+$/)).min(10).max(13),
    password: Joi.string().required().min(6),
    address: Joi.string().required(),
    gender: Joi.string().valid('LK','PR').required()
})

const bodyUpdateOperator = Joi.object({
    name: Joi.string().required(),
    no_hp: Joi.string().pattern(new RegExp(/^\d+$/)).min(10).max(13),
    address: Joi.string().required(),
    gender: Joi.string().valid('LK','PR').required()
})

const queryOperators = Joi.object({
    type: Joi.string().valid('active', 'not-active').required()
})


const uploadFile = storage.fields([{name: 'thumbnail', maxCount: 1}, {name: 'ktp', maxCount: 1}])
const uploadThumbnail = storage.single('thumbnail')
router.get('/profile', getUserProfile)
router.put('/', (req, res, next) => {
    multerWithErrorHandling(uploadThumbnail, req, res, next)
}, validator.body(bodyUpdateOperator), updateUser);

router.use(adminAuthorization)
router.get('/operators',validator.query(queryOperators), getOperator)
router.post('/operators', (req, res, next) => {
    multerWithErrorHandling(uploadFile, req, res, next)
}, validator.body(bodyAddOperator), addOperator)

router.get('/operators/:id' , detailOperator)
router.put('/operators/:id', (req, res, next) => {
    multerWithErrorHandling(uploadFile, req, res, next)
}, validator.body(bodyUpdateOperator), updateOperator)
router.patch('/operators/:id', setOperatorStatus)
module.exports = router