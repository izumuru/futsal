//node modules
const Joi = require("joi");
const multer = require('multer')
//local
const storage = require("../helpers/file_upload");
const {router, validator} = require('./index')
const authorization = require('../middleware/')
const { addField } = require("../services/field.service");



const bodyAddField = Joi.object({
    name: Joi.string().required(),
})
const uploadImage = storage.fields([
    {name: 'fieldImages', maxCount: 5}
])
router.use(authorization)
router.post('/fields', (req, res, next) => {
    uploadImage(req, res, (err) => {
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
}, validator.body(bodyAddField), addField)

module.exports = router