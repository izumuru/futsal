const {Fields, Booking, PaymentMethod} = require('../models')
const {sequelize} = require('../models/index')
const { uid } = require('uid')
async function createWebBooking(request, response) {
    const t = await sequelize.transaction()
    try {
        const {
            field_id: fieldId,
            booking_date : bookingDate,
            booking_time: bookingTime,
            duration,
        } = request.body
        const field = await Fields.findOne({where: {field_id: fieldId}})
        if(!field) return response.status(404).json({
            status: 404,
            message: "Lapangan tidak ditemukan"
        })
        let price = field.harga
        let typePrice = "day"
        if(field.waktu_mulai_malam === bookingTime) {
            price = field.harga_malam
            typePrice = "night"
        }
        const bookingExist = await Booking.findOne({where:{booking_time: bookingTime, booking_date: bookingDate}})
        if(bookingExist) return response.status(400).json()
        const paymentMethod = await PaymentMethod.findOne({where: {platform_payment_method: "web"}})
        const booking = await Booking.create({
            payment_method_id: paymentMethod.payment_method_id,
            field_id: field.field_id,
            user_id: response.locals.user.user_id,
            booking_date: bookingDate,
            booking_time: bookingTime,
            total_price: (duration * price),
            status_bayar: "paid",
            booking_code: uid(12),
            day_price: typePrice === "day" ? field.harga : null,
            night_price: typePrice === "night" ? field.harga_malam: null,
            tanggal_pembayaran: new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate(),
            platform_booking: "web",
            booking_payment_method_name: "cash"
        }, {returning: true, transaction: t})
        response.status(200).json({
            status: 200,
            message: "Berhasil tambah booking"
        })
        t.commit()
    } catch (error) {
        t.rollback()
        console.log(error)
        response.status(500).json({
            status: 500,
            message: "Internal server error"
        })
    }
}

module.exports = {createWebBooking}