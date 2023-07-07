const {Fields, Gallery, DaysActive, Days} = require('../models')
const {sequelize} = require('../models/index')
const path = require("path");
const fs = require('fs')
const ClientError = require("../helpers/client_error");
const {where} = require("sequelize");

async function addField(request, response) {
    const t = await sequelize.transaction();
    try {
        const {
            name,
            description,
            booking_open: bookingOpen,
            booking_close: bookingClose,
            waktu_mulai_malam: waktuMulaiMalam,
            harga,
            harga_malam: hargaMalam,
            daysActive: days
        } = request.body
        if (request.files.length === 0) {
            throw new ClientError(JSON.stringify({
                status: 400,
                message: "Wajib memiliki 1 gambar lapangan"
            }), 400)
        }
        const field = await Fields.create({
            name,
            description,
            booking_open: bookingOpen,
            booking_close: bookingClose,
            waktu_mulai_malam: waktuMulaiMalam ? waktuMulaiMalam : null,
            harga,
            harga_malam: hargaMalam ? hargaMalam : null
        }, {returning: true, transaction: t})
        const galleries = request.files.map(value => {
            return {
                field_id: field.field_id,
                image: value.filename
            }
        })
        const daysActive = days.split(',').map(value => {
            return {
                field_id: field.field_id,
                day_id: value
            }
        })
        await Gallery.bulkCreate(galleries, {returning: false, transaction: t})
        await DaysActive.bulkCreate(daysActive, {returning: false, transaction: t})
        response.status(201).json({
            status: 201,
            message: 'Berhasil tambah lapangan'
        })
        t.commit()
    } catch (e) {
        t.rollback()
        console.log(e)
        if(e instanceof ClientError) {
            return response.status(e.statusCode).json(JSON.parse(e.message))
        }
        response
            .status(500)
            .json({
                status: 500,
                message: "Internal server error"
            })
    }
}

async function updateField(request, response) {
    const t = await sequelize.transaction();
    try {
        const {id} = request.params
        const {
            name,
            description,
            booking_open: bookingOpen,
            booking_close: bookingClose,
            waktu_mulai_malam: waktuMulaiMalam,
            harga,
            harga_malam: hargaMalam,
            addDays: days,
            deleteDays,
        } = request.body
        const field = await Fields.findOne({where: {field_id: id}})
        if (!field) throw new ClientError({
            status: 404,
            message: "Lapangan tidak ditemukan"
        }, 404)

        const addDays = []
        for(const value of days) {
            addDays.push({field_id: field.field_id, day_id: value.day_id})
        }
        await field.update({
            name,
            description,
            booking_open: bookingOpen,
            booking_close: bookingClose,
            waktu_mulai_malam: waktuMulaiMalam ? waktuMulaiMalam : null,
            harga,
            harga_malam: hargaMalam ? hargaMalam : null
        }, {returning: false, transaction: t})
        await DaysActive.bulkCreate(addDays)
        await DaysActive.destroy({where: {days_active_id: deleteDays}})
        response.status(200).json({
            status: 200,
            message: 'Berhasil update lapangan'
        })
        t.commit()
    } catch (e) {
        t.rollback()
        console.log(e)
        if(e instanceof ClientError) {
            return response.status(e.statusCode).json(JSON.parse(e.message))
        }
        response
            .status(500)
            .json({
                status: 500,
                message: "Internal server error"
            })
    }
}

async function updateFieldImage(request, response) {
    try {
        const {id, field_id} = request.params
        const fieldImage = await Gallery.findOne({where: {field_id, gallery_id: id}})
        if (!fieldImage) return response.status(404).json({
            status: 404,
            message: 'Gambar lapangan tidak ditemukan'
        })
        const image = request.file
        fs.unlink(path.join(__dirname, '../../public/' + fieldImage.image), (err) => {
            if (err) console.log(err)
        })
        await fieldImage.update(({image: image.filename}))
        response.status(200).json({
            status: 200,
            message: 'Berhasil update gambar lapangan'
        })
    } catch (e) {
        console.log(e)
        response.status(500).json({
            status: 500,
            message: 'Internal server error'
        })
    }
}

async function addImage(request, response) {
    try {
        const {field_id: id} = request.params
        const fieldExist = await Fields.findByPk(id)
        if(!fieldExist) return response.status(404).json({
            status: 404,
            message: 'Lapangan tidak ditemukan'
        })
        const {count} = await Gallery.findAndCountAll({where: {field_id: id}});
        if(count >= 5) {
            return response.status(400).json({
                status: 400,
                message: 'Gambar sudah penuh'
            })
        }
        const galleries = request.files.map(value => {
            return {
                field_id: id,
                image: value.filename
            }
        })
        await Gallery.bulkCreate(galleries, {returning: false})
        return response.status(200).json({
            status: 200,
            message: 'Berhasil tambah gambar lapangan'
        })
    } catch (e) {
        console.log(e)
        return response.status(500).json({
            status: 500,
            message: 'Internal server error'
        })
    }
}

async function deleteImage(request, response) {
    try {
        const {id, field_id} = request.params
        const image = await Gallery.findOne({where: {gallery_id: id, field_id: field_id}})
        if (!image) return response.status(404).json({
            status: 404,
            message: 'Gambar lapangan tidak ditemukan'
        })
        fs.unlink(path.join(__dirname, '../../public/' + image.image), (err) => {
            if (err) {
                console.log(err)
            }
        })
        await image.destroy({returning: false})
        response.status(200).json({
            status: 200,
            message: 'Behasil hapus gambar lapangan'
        })
    } catch (e) {
        console.log(e)
        response.status(500).json({
            status: 500,
            message: 'Internal server error'
        })
    }
}

async function detailField(request, response) {
    const {id} = request.params
    const field = await Fields.findOne({where: {field_id: id}, include: [{model: Gallery}, {model: DaysActive, include: Days}]})
    console.log()
    if (!field) return response.status(404).json({
        status: 404,
        message: 'Lapangan tidak ditemukan'
    })
    return response.status(200).json({
        status: 200,
        data: {
            name: field.name,
            description: field.description,
            booking_open: field.booking_open,
            booking_close: field.booking_close,
            waktu_mulai_malam: field.waktu_mulai_malam,
            harga: field.harga,
            days_active: field.DaysActives.map(value => ({days_active_id: value.days_active_id, day_name: value.Day.day_name})),
            harga_malam: field.harga_malam,
            galleries: field.Galleries.map(value => {
                return {
                    gallery_id: value.gallery_id,
                    image: process.env.APP_URL + '/' + value.image
                }
            })
        }
    })
}

async function getField(request, response) {
    const fields = await Fields.findAll({include: [{model: Gallery, order: ['gallery_id', 'ASC']}, {model: DaysActive, include: Days}]})
    return response.status(200).json({
        status: 200,
        data: fields.map(value => {
            const data = {
                field_id: value.field_id,
                name: value.name,
                harga: value.harga,
                harga_malam: value.harga_malam,
                open: value.booking_open.split(':')[0] + ":00",
                close: value.booking_close.split(':')[0] + ":00",
                days_active: value.DaysActives.map(value => value.Day.day_name).join(', '),
            }
            if (value.Galleries.length > 0) {
                data['image'] = process.env.APP_URL + '/' + value.Galleries.pop().image
            }
            return data
        })
    })
}

async function getDays(request, response) {
    const days = await Days.findAll()
    return response.status(200).json({
        status: 200,
        data: days.map(value => ({day_id: value.day_id, name: value.day_name}))
    })
}

async function deleteField(request, response) {
    const {id} = request.params
    const field = await Fields.findOne({where: {field_id: id}})
    if (!field) return response.status(404).json({
        status: 404,
        message: 'Lapangan tidak ditemukan'
    })
    await field.destroy({returning: false})
    return response.status(200).json({
        status: 200,
        message: 'Berhasil hapus lapangan'
    })
}

module.exports = {addField, deleteImage, updateFieldImage, updateField, detailField, getField, getDays, addImage, deleteField}