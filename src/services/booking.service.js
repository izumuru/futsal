const {Fields, Booking, PaymentMethod, User, PaymentType} = require('../models')
const {sequelize} = require('../models/index')
const {uid} = require('uid')
const {getDate, getDateBasedFormat, addHourToDate} = require('../helpers/date')
const moment = require("moment/moment");
const axios = require("axios");
const {response} = require("express");
const {admin} = require("../helpers/firebase");
const ClientError = require("../helpers/client_error");
const { Op } = require("sequelize");
async function createWebBooking(request, response) {
    const t = await sequelize.transaction()
    try {
        const user = response.locals.user
        const validation = await bookingValidation(request, "web")
        if(validation.status) throw new ClientError(JSON.stringify(validation), validation.status)
        const orderCode = uid(6).toUpperCase()
        const payload = await payloadCreateBooking(validation, {userId: user.user_id, platform: "web", orderCode: orderCode})
        const booking = await Booking.create(payload, {returning: true, transaction: t})
        response.status(200).json({
            status: 200,
            data: {
                booking_id: booking.booking_id,
            }
        })
        t.commit()
    } catch (error) {
        t.rollback()
        console.log(error)
        if(error instanceof ClientError) {
            return response.status(error.statusCode).json(JSON.parse(error.message))
        }
        response.status(500).json({
            status: 500,
            message: "Internal server error"
        })
    }
}

async function createMobileBooking(request, response) {
    const t = await sequelize.transaction()
    try {
        const user = response.locals.user
        const validation = await bookingValidation(request, "mobile")
        if(validation.status) throw new ClientError(JSON.stringify(validation), validation.status)
        const orderCode = uid(6).toUpperCase()
        const createPayment = await createMidtransPayment({
            type: validation.paymentTypeName,
            orderId: orderCode,
            bank: validation.paymentName,
            user: user,
            amount: (validation.day_price * validation.duration) + (validation.night_price + validation.duration_night) + validation.adminPrice
        })
        if (createPayment.status_code !== '201') throw new Error(createPayment.status_message)
        const payload = await payloadCreateBooking(validation, {
            userId: user.user_id,
            platform: "mobile",
            code: createPayment.va_numbers ? createPayment.va_numbers[0].va_number : createPayment.payment_code,
            expiredDate: createPayment.expiry_time ? createPayment.expiry_time : null,
            orderCode: orderCode
        })
        const booking = await Booking.create(payload, {returning: true, transaction: t})
        response.status(200).json({
            status: 200,
            data: {
                booking_id: booking.booking_id,
                payment_method_id: booking.payment_method_id
            }
        })
        t.commit()
    } catch (error) {
        t.rollback()
        console.log(error)
        if(error instanceof ClientError) {
            return response.status(error.statusCode).json(JSON.parse(error.message))
        }
        response.status(500).json({
            status: 500,
            message: "Internal server error"
        })
    }
}

async function bookingValidation(request, platform) {
    const {
        field_id: fieldId,
        booking_date: bookingDate,
        booking_time: bookingTime,
        duration,
        payment_method_id
    } = request.body
    const field = await Fields.findOne({where: {field_id: fieldId}})
    if (!field) return {
        status: 404,
        message: "Lapangan tidak ditemukan"
    }
    if(new Date(bookingDate).getTime() < moment(new Date().getTime()).tz('Asia/Jakarta').unix()) {
        return {
            status: 400,
            message: "Tanggal tidak valid"
        }
    }
    if(field.booking_close === bookingTime + ":00") {
        return {
            status: 400,
            message: "Lapangan sudah tutup"
        }
    }
    if(+bookingTime.split(':')[0] + duration > +field.booking_close.split(':')[0]) {
        return {
            status: 400,
            message: "Lapangan sudah tutup"
        }
    }
    const durationCustomerPlay = parseInt(bookingTime.split(":")[0])
    const unAvailableTime = await getListUnavailableTimeField(fieldId, bookingDate)
    const unavailable = unavailableTimeArray(field, bookingDate, unAvailableTime)
    for(let i = durationCustomerPlay; i < (durationCustomerPlay + duration); i++) {
        if(unavailable.includes(i)) {
            return {
                status: 400,
                message: "Lapangan sudah di booking untuk waktu tersebut"
            }
        }
    }
    const paymentMethod = await PaymentMethod.findOne({
        where: {payment_method_id: payment_method_id ? payment_method_id : 6, platform_payment_method: platform},
        include: {model: PaymentType}
    })
    if (!paymentMethod) return {
        status: 400,
        message: "Metode Pembayaran tidak ditemukan"
    }

    let day_price = 0
    let night_price = 0
    let duration_night = 0
    let new_duration = duration
    if (+bookingTime.split(':')[0] >= +field.waktu_mulai_malam.split(':')[0]) {
        night_price = field.harga_malam
        duration_night = duration
        new_duration = 0;
    } else {
        day_price = field.harga
    }
    if(duration === 2 && ((+bookingTime.split(':')[0]) + 1 == +field.waktu_mulai_malam.split(':')[0])) {
        night_price = field.harga_malam
        duration_night = 1
        new_duration -= 1
    }
    return {
        day_price,
        night_price,
        bookingDate,
        bookingTime,
        duration: new_duration,
        duration_night,
        fieldId: field.field_id,
        paymentId: paymentMethod.dataValues.payment_method_id,
        paymentName: paymentMethod.dataValues.payment_method_name,
        paymentTypeName: paymentMethod.dataValues.PaymentType.dataValues.payment_type_name,
        adminPrice: paymentMethod.dataValues.payment_admin_nominal
    }
}

async function payloadCreateBooking(validation, payload) {
    const {userId, platform, code, expiredDate, orderCode} = payload
    const {
        day_price,
        night_price,
        bookingDate,
        bookingTime,
        duration,
        duration_night,
        fieldId,
        paymentId,
        paymentName,
        adminPrice,
        paymentTypeName
    } = validation
    console.log(duration, day_price, duration_night, night_price, adminPrice)
    const data = {
        payment_method_id: paymentId,
        field_id: fieldId,
        user_id: userId,
        booking_date: bookingDate,
        booking_time: bookingTime,
        total_price: (duration * day_price) + (duration_night * night_price) + adminPrice,
        booking_code: orderCode,
        day_price: day_price,
        night_price: night_price,
        day_price_quantity: duration,
        night_price_quantity: duration_night,
        platform_booking: platform,
        booking_payment_method_name: paymentName === "Cash" ? paymentName : paymentTypeName + " " + paymentName
    }
    if (platform === "web") {
        data['tanggal_pembayaran'] = new Date()
        data["status_bayar"] = "paid"
    } else {
        data['virtual_account_code'] = code
        data['tanggal_batas_pembayaran'] = expiredDate
        data['status_bayar'] = "waiting"
        data['admin_price'] = adminPrice
    }
    return data
}

async function getBookingGroupByField(request, response) {
    const {date} = request.query
    const bookings = await Fields.findAll({
        include: {
            model: Booking,
            where: {booking_date: date, canceled_by_admin: false},
            attributes: ['booking_id', 'booking_time', 'day_price_quantity', 'night_price_quantity', 'platform_booking'],
            include: {
                model: User,
                attributes: ['name', 'type']
            }
        },
        attributes: ['field_id', 'name'],
        order: [['field_id', 'ASC']]
    })
    const schema = bookings.map(value => {
        return {
            field_id: value.field_id,
            name: value.name,
            bookings: value.Bookings.map(value => {
                const time = parseInt(value.booking_time.split(':')[0])
                const duration = value.day_price_quantity + value.night_price_quantity
                const bookingTime = `${getDateBasedFormat(addHourToDate(date, time), 'HH:mm')}-${getDateBasedFormat(addHourToDate(date, time, duration), 'HH:mm')}`
                return {
                    booking_id: value.booking_id,
                    booking_time: bookingTime,
                    platform_booking: value.platform_booking,
                    user: value.User
                }
            })
        }
    })
    response.status(200).json({
        status: 200,
        data: schema
    })
}

async function getDetailBooking(request, response) {
    const {booking_id} = request.params
    const booking = await Booking.findByPk(booking_id, {
        include: [
            {
                model: User,
                attributes: ['name', 'username', 'gender', 'alamat', 'no_hp', 'email', 'thumbnail']
            },
            {
                model: Fields,
                attributes: ['name'],
                paranoid: false,
            },
        ],
        attributes: [
            'day_price', 'night_price', 'total_price',
            'day_price_quantity', 'night_price_quantity', 'booking_date',
            'booking_time', 'status_bayar', 'platform_booking',
            'booking_payment_method_name', 'admin_price', 'tanggal_pembayaran', 'booking_code',
            'createdAt', 'virtual_account_code',
            'canceled_by_admin', 'updatedAt', 'status_previous'
        ]
    })
    if (!booking) return response.status(404).json({
        status: 404,
        message: "Booking tidak ditemukan"
    })
    const schema = {
        night_price: booking.night_price,
        day_price: booking.day_price,
        total_price: booking.total_price,
        admin_price: booking.admin_price === null ? undefined : booking.admin_price,
        duration: booking.day_price_quantity + booking.night_price_quantity,
        booking_date_time: getDateBasedFormat(addHourToDate(booking.booking_date, parseInt(booking.booking_time.split(":")[0])), 'DD MMM YYYY, HH:mm'),
        day_price_quantity: booking.day_price_quantity,
        night_price_quantity: booking.night_price_quantity,
        field_name: booking.Field.name,
        payment_method: booking.payment_method_name,
        booking_payment_method_name: booking.booking_payment_method_name,
        tanggal_pembayaran: booking.tanggal_pembayaran !== null ? getDateBasedFormat(booking.tanggal_pembayaran.getTime(), 'DD MMM YYYY, HH:mm', true) : null,
        tanggal_batas_pembayaran: getDateBasedFormat((booking.createdAt.getTime() + (15 * 60 * 1000)), 'DD MMM YYYY, HH:mm', true),
        verification_code: booking.booking_code,
        platform_booking: booking.platform_booking,
        virtual_account_code: booking.virtual_account_code,
        status_bayar: (booking.status_bayar === 'waiting') ? (new Date().getTime() > (booking.createdAt.getTime() + (15 * 60 * 1000)) ? "canceled" : "waiting") : booking.status_bayar,
        user: {
            name: booking.User.name,
            username: booking.User.username,
            gender: booking.User.gender,
            alamat: booking.User.alamat,
            no_hp: booking.User.no_hp,
            email: booking.User.email,
            thumbnail: booking.User.thumbnail !== null ? `${process.env.APP_URL}/${booking.User.thumbnail}` : null
        },
        canceled_by_admin: booking.canceled_by_admin,
        updated_at: booking.updatedAt,
        status_previous: booking.status_previous
    }
    response.status(200).json({
        status: 200,
        data: schema
    })
}

async function getListBooking(request, response) {
    const {status_bayar, start_date, end_date} = request.query
    const condition = {
        where: {
            booking_date: {[Op.between]: [start_date, end_date]}
        },
        include: [{model: Fields, attributes: ['name'], paranoid: false}, {model: User, attributes: ['name']}],
        order: [['booking_date', 'ASC']]
    }
    if(status_bayar !== 'canceled' && status_bayar !== 'canceled_admin') {
        condition['where']['status_bayar'] = status_bayar
    } else if (status_bayar && status_bayar === 'canceled_admin') {
        condition['where']['status_bayar'] = 'canceled'
        condition['where']['canceled_by_admin'] = true
    }
    const bookings = await Booking.findAll(condition)
    return response.status(200).json({
        status: 200,
        data: bookings.map((value) => {
            return {
                booking_id: value.booking_id,
                user_name: value.User.name,
                field_name: value.Field.name,
                booking_date: getDateBasedFormat(addHourToDate(value.booking_date, parseInt(value.booking_time.split(":")[0])), 'DD MMM YYYY, HH:mm'),
                duration: value.day_price_quantity ? value.day_price_quantity : value.night_price_quantity,
                status_bayar: (value.status_bayar === 'waiting') ? (new Date().getTime() > (value.createdAt.getTime() + (15 * 60 * 1000)) ? "canceled" : "waiting") : value.status_bayar
            }
        }).filter((value) => {
            if(status_bayar && (value.status_bayar === status_bayar || status_bayar === 'canceled_admin')) {
                return true;
            } else return !status_bayar;
        })
    })
}

async function getAvailableTime(request, response) {
    const {date} = request.query
    const {field_id: id} = request.params
    const field = await Fields.findOne({where: {field_id: id}})
    if (!field) return response.status(404).json({
        status: 404,
        message: "Lapangan tidak ditemukan"
    })
    const list = await getListUnavailableTimeField(id, date);
    response.status(200).json({
        status: 200,
        data: availableTime(field, date, list)
    })
}

async function midtransCallback(request, response) {
    const {va_numbers, transaction_status, payment_type, payment_code} = request.body
    let code = payment_code;
    if(payment_type === 'bank_transfer') {
        code = va_numbers[0].va_number
    }
    const booking = await Booking.findOne({where: {virtual_account_code:code}, include: [{model: Fields, attributes: ['name']}, {model : User, attributes: ['fcm_token']}]})
    let update
    if(transaction_status === "settlement") {
        update = {status_bayar: "paid", tanggal_pembayaran: moment().tz('Asia/Jakarta').format()}
        admin.messaging().send( {
            token: booking.User.fcm_token,
            notification: {
                title: "Pemesanan lapangan berhasil dibayar",
                body: `Pemesanan ${booking.Field.name} pada tanggal ${getDateBasedFormat(addHourToDate(booking.booking_date, parseInt(booking.booking_time.split(":")[0])), 'DD MMM YYYY, HH:mm')} berhasil di booking`
            },
        }).then((result) => console.log(result))
            .catch((err) => {
            console.log(err)
        })
    } else if(['deny', 'cancel', 'expire'].includes(transaction_status)) {
        update = {status_bayar: "canceled"}
    }
    await booking.update(update)
    return response.status(200).json('success');
}

async function cancelBooking(request, response) {
    const {booking_id} = request.params
    const booking = await Booking.findOne({where: {booking_id}})
    if(!booking) return response.status(404).json({
        status: 404,
        message: "Booking tidak ditemukan"
    })
    if(booking.status_bayar === 'waiting') {
        const {data} = await axios.post(process.env.MIDTRANS_PAYMENT_CANCEL + `orderId-${booking.booking_code}/cancel`, {},{
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                Authorization: `Basic ${process.env.MIDTRANS_AUTH}`
            }
        })
        console.log(data);
    }
    await booking.update({status_bayar: "canceled", status_previous: booking.status_bayar === "waiting" ? "canceled" : booking.status_bayar, canceled_by_admin: true})
    return response.status(200).json({
        status: 200,
        message: "Booking berhasil dibatalkan"
    })
}

async function getListUnavailableTimeField(id, date) {
    const bookings = await Booking.findAll({where: {field_id: id, booking_date: date}});
    const data = []
    for(const value of bookings) {
        if(value.status_bayar === "paid" || (value.status_bayar === "waiting" &&  new Date().getTime() < (value.createdAt.getTime() + (15 * 60 * 1000)))) {
            const time = value.booking_time.split(':')
            const duration = value.day_price_quantity + value.night_price_quantity;
            const date = value.booking_date.getTime()
            const hour = parseInt(time[0])
            data.push([(date + (hour * 60 * 60 * 1000)), (date + ((hour + duration) * 60 * 60 * 1000))])
        }
    }
    return data
}

function unavailableTimeArray(field, date, list) {
    const open = parseInt(field.booking_open.split(':')[0])
    const close = parseInt(field.booking_close.split(':')[0])
    const dateConvert = new Date(date)
    const unavailable = []
    for (let i = open; i < close; i++) {
        const dateTime = addHourToDate(dateConvert, i)
        for (const elm of list) {
            if (dateTime >= elm[0] && dateTime < elm[1]) {
                unavailable.push(i)
                break;
            }
        }
    }
    return unavailable
}

function availableTime(field, date, list) {
    const open = parseInt(field.booking_open.split(':')[0])
    const close = parseInt(field.booking_close.split(':')[0])
    const dateConvert = new Date(date)
    const available = {}
    for (let i = open; i < close; i++) {
        const dateTime = addHourToDate(dateConvert, i)
        const key = `${getDateBasedFormat(dateTime, 'HH:mm')}-${getDateBasedFormat(addHourToDate(dateConvert, i, 1), 'HH:mm')}`
        available[key] = true
        for (const elm of list) {
            if (dateTime >= elm[0] && dateTime < elm[1]) {
                available[key] = false
                break;
            }
        }
    }
    return available
}
async function createMidtransPayment(payload) {
    try {
        const {type, orderId, amount, bank, user} = payload
        const requestPayload = type !== 'Gerai' ? vaPayload(orderId, amount, bank) : otcPayload(orderId, amount, 'alfamart', user)
        const {data} = await axios.post(process.env.MIDTRANS_PAYMENT_URL, requestPayload, {
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                Authorization: `Basic ${process.env.MIDTRANS_AUTH}`
            }
        })
        return data;
    } catch (e) {
        console.log(e)
        return e.data
    }

}

function vaPayload(orderId, amount, bank) {
    return {
        payment_type: 'bank_transfer',
        transaction_details: {order_id: `orderId-${orderId}`, gross_amount: amount},
        bank_transfer: {bank}
    }
}

function otcPayload(orderId, amount, store, user) {
    return {
        payment_type: 'cstore',
        transaction_details: {order_id: `orderId-${orderId}`, gross_amount: amount},
        cstore: {store},
        customer_details: {
            first_name: user.name,
            email: user.email,
            phone: user.no_hp
        }
    }
}

module.exports = {createWebBooking, getAvailableTime, getBookingGroupByField, getDetailBooking, createMobileBooking, midtransCallback,  getListBooking, cancelBooking}