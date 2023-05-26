const { string } = require("joi")
const { sequelize } = require("../models")
const { Field, Gallery } = require('../models/fields')

async function addField(request, response) {
    try {
        const {
            name,
            description, 
            booking_open: bookingOpen,
            booking_close: bookingClose,
            waktu_mulai_malam: waktuMulaiMalam,
            harga,
            harga_malam: hargaMalam,
         } = request.body
         const {fieldImage} = request.files
         const field = await Field.create({
            name,
            description,
            booking_open: bookingOpen,
            booking_close: bookingClose,
            waktu_mulai_malam: waktuMulaiMalam ? waktuMulaiMalam : null,
            harga,
            harga_malam: hargaMalam ? hargaMalam : null
         }, {returning: true})
         const galleries = fieldImage.map(value => {
            return {
                field_id: field.field_id,
                image: value.filename
            }
         })
         await Gallery.bulkCreate(galleries)
         response.status(201).json({
            status: 201,
            message: 'Berhasil tambah lapangan'
         })
    } catch (e) {
        response
        .status(500)
        .json({
            status: 500,
            message: "Internal server error"
        })
    }
}

module.exports = { addField }