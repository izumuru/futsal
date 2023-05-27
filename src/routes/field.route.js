//node modules
const Joi = require("joi");
const multer = require('multer')
//local
const storage = require("../helpers/file_upload");
const {router, validator} = require('./index')
const adminAuthorization = require('../middleware/admin.authorization')
const { addField, updateFieldImage, deleteImage, updateField, detailField, getField} = require("../services/field.service");
const {multerWithErrorHandling} = require("../helpers/erorr_handling");

const bodyAddField = Joi.object({
    name: Joi.string().required(),
    description: Joi.string(),
    booking_open: Joi.string().required(),
    booking_close: Joi.string().required(),
    waktu_mulai_malam: Joi.string(),
    harga: Joi.number().min(1).required(),
    harga_malam: Joi.number().min(1)
})
const paramsValidation = Joi.object({
    id: Joi.number().required(),
})
const paramsValidationImage = Joi.object({
    id: Joi.number().required(),
    field_id: Joi.number().required()
})

const uploadImage = storage.array('fieldImages', 5)
const singleUploadImage = storage.single('fieldImages')


router.use(adminAuthorization)
router.get('/', getField)
router.post('/', (req, res, next) => {
    multerWithErrorHandling(uploadImage, req, res, next)
}, validator.body(bodyAddField), addField)

router.put('/:id', validator.params(paramsValidation), validator.body(bodyAddField), updateField)
router.get('/:id', validator.params(paramsValidation), detailField)
router.patch('/:field_id/gallery/:id', validator.params(paramsValidationImage),(req, res, next) => {
    multerWithErrorHandling(singleUploadImage, req, res, next)
}, updateFieldImage)
router.delete('/:field_id/gallery/:id', validator.params(paramsValidationImage), deleteImage)

module.exports = router