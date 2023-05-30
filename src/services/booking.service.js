const {Fields, Booking, PaymentMethod, User, PaymentType} = require('../models')
const {sequelize} = require('../models/index')
const {uid} = require('uid')
const {getDate} = require('../helpers/date')
const moment = require("moment/moment");

async function createWebBooking(request, response) {
    const t = await sequelize.transaction()
    try {
        const {
            field_id: fieldId,
            booking_date: bookingDate,
            booking_time: bookingTime,
            duration,
        } = request.body
        const field = await Fields.findOne({where: {field_id: fieldId}})
        if (!field) return response.status(404).json({
            status: 404,
            message: "Lapangan tidak ditemukan"
        })
        let price = field.harga
        let typePrice = "day"
        if (field.waktu_mulai_malam === bookingTime) {
            price = field.harga_malam
            typePrice = "night"
        }
        const bookingExist = await Booking.findOne({where: {booking_time: bookingTime, booking_date: bookingDate}, lock: true})
        if (bookingExist) return response.status(400).json({
            status: 400,
            message: "Lapangan sudah di booking untuk waktu tersebut"
        })
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
            night_price: typePrice === "night" ? field.harga_malam : null,
            day_price_quantity: typePrice === "day" ? duration : null,
            night_price_quantity: typePrice === "night" ? duration : null,
            tanggal_pembayaran: new Date(),
            platform_booking: "web",
            booking_payment_method_name: "Uang Tunai / Cash"
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

async function createMobileBooking(request, response) {
    const t = await sequelize.transaction()
    try {
        const {
            field_id: fieldId,
            booking_date: bookingDate,
            booking_time: bookingTime,
            duration,
            payment_method_id,
        } = request.body
        const field = await Fields.findOne({where: {field_id: fieldId}})
        if (!field) return response.status(404).json({
            status: 404,
            message: "Lapangan tidak ditemukan"
        })
        let price = field.harga
        let typePrice = "day"
        if (field.waktu_mulai_malam === bookingTime) {
            price = field.harga_malam
            typePrice = "night"
        }
        const bookingExist = await Booking.findOne({where: {booking_time: bookingTime, booking_date: bookingDate}, lock: true})
        if (bookingExist) return response.status(400).json({
            status: 400,
            message: "Lapangan sudah di booking untuk waktu tersebut"
        })
        const paymentMethod = await PaymentMethod.findOne({where: {field_id: fieldId}, include: {model: PaymentType}})
        if(!paymentMethod) return response.status(400).json({
            status: 400,
            message: "Metode Pembayaran tidak ditemukan"
        })
        await Booking.create({
            payment_method_id: paymentMethod.payment_method_id,
            field_id: field.field_id,
            user_id: response.locals.user.user_id,
            booking_date: bookingDate,
            booking_time: bookingTime,
            total_price: (duration * price),
            status_bayar: "waiting",
            booking_code: uid(12),
            day_price: typePrice === "day" ? field.harga : null,
            night_price: typePrice === "night" ? field.harga_malam : null,
            day_price_quantity: typePrice === "day" ? duration : null,
            night_price_quantity: typePrice === "night" ? duration : null,
            platform_booking: "mobile",
            booking_payment_method_name: paymentMethod.PaymentType.name,
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

async function getListUnavailableTimeField(id, date, time) {
    const bookings = await Booking.findAll({where: {field_id: id, booking_date: date}});
    const data = []
    bookings.forEach((value) => {
        const key = moment(value.booking_date).format('YYYY-MM-DD')
        const time = value.booking_time.split(':')
        const duration = value.day_price_quantity !== null ? value.day_price_quantity : value.night_price_quantity;
        const date = value.booking_date.getTime()
        const hour = parseInt(time[0])
        data.push([date + (hour * 60 * 60 * 1000), date + ((hour + duration) * 60 * 60 * 1000)])
    })
    return data
}

async function getBookingGroupByField(request, response) {
    const {date} = request.query
    const bookings = await Fields.findAll({
        include: {
            model: Booking,
            where: {booking_date: date},
            attributes: ['booking_id', 'booking_time', 'day_price_quantity', 'night_price_quantity', 'platform_booking'],
            include: {
                model: User,
                attributes: ['name', 'type']
            }
        },
        attributes: ['field_id', 'name']
    })
    const schema = bookings.map(value => {
        return {
            field_id: value.field_id,
            name: value.name,
            bookings: value.Bookings.map(value => {
                const time = parseInt(value.booking_time.split(':')[0])
                const duration = value.day_price_quantity === null ? value.night_price_quantity : value.day_price_quantity
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
                attributes: ['name']
            },
        ],
        attributes: [
            'day_price', 'night_price', 'total_price',
            'day_price_quantity', 'night_price_quantity', 'booking_date',
            'booking_time', 'status_bayar', 'platform_booking',
            'booking_payment_method_name', 'admin_price', 'tanggal_pembayaran'
        ]
    })
    if(!booking) return response.status(404).json({
        status: 404,
        message: "Booking tidak ditemukan"
    })
    const schema = {
        night_price: booking.night_price !== null ? booking.night_price : undefined,
        day_price: booking.day_price !== null ? booking.day_price : undefined,
        total_price: booking.total_price,
        admin_price: booking.admin_price === null ? undefined : booking.admin_price,
        duration: booking.day_price_quantity === null ? booking.night_price_quantity : booking.day_price_quantity,
        booking_date_time: getDateBasedFormat(addHourToDate(booking.booking_date, parseInt(booking.booking_time.split(":")[0])), 'DD MMM YYYY, HH:mm'),
        field_name: booking.Field.name,
        payment_method: booking.payment_method_name,
        tanggal_pembayaran: booking.tanggal_pembayaran !== null ? getDateBasedFormat(booking.tanggal_pembayaran.getTime(), 'DD MMM YYYY, HH:mm') : null,
        verification_code: booking.booking_code,
        platform_booking: booking.platform_booking,
        status_bayar: booking.status_bayar,
        user: {
            name: booking.User.name,
            username: booking.User.username,
            gender: booking.User.gender,
            alamat: booking.User.alamat,
            no_hp: booking.User.no_hp,
            email: booking.User.email,
            thumbnail: booking.User.thumbnail !== null ? `${process.env.APP_URL}/${booking.User.thumbnail}` : null
        },
    }
    response.status(200).json({
        status: 200,
        data: schema
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

function availableTime(field, date, list) {
    const open = parseInt(field.booking_open.split(':')[0])
    const close = parseInt(field.booking_close.split(':')[0])
    const dateConvert = new Date(date)
    const available = {}
    for (let i = open; i < close; i++) {
        const dateTime = addHourToDate(dateConvert, i)
        console.log(dateTime)
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

function addHourToDate(date, hour, incrementHour) {
    const time = 60 * 60 * 1000
    let dateTime = date.getTime()
    if (incrementHour) {
        return dateTime + ((hour + incrementHour) * time)
    }
    return dateTime + (hour * time)
}

function getDateBasedFormat(unixTime, format) {
    return moment.unix(unixTime / 1000).utc().locale('id').format(format)
}

module.exports = {createWebBooking, getAvailableTime, getBookingGroupByField, getDetailBooking}