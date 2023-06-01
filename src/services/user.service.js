const {User, Auth, ForgotPassword, Booking, Fields, Gallery} = require("../models");
const bcrypt = require("bcrypt");
const {signToken} = require("../helpers/jwt");
const {transporter, mailOptions} = require("../helpers/mail");
const {uid} = require("uid");
const moment = require("moment");
const {getDateBasedFormat, addHourToDate} = require("../helpers/date");

async function logout(request, response) {
    const user = response.locals.user
    const {token} = request.headers
    const auth = await Auth.findOne({where: {user_id: user.user_id, token}})
    console.log(auth.token)
    await auth.update({is_valid: false})
    return response.status(200).json({
        status: 200,
        message: "Berhasil logout"
    })
}
async function login(request, response) {
    try {
        const {email, password, fcm_token} = request.body
        const user = await User.findOne({where: {email: email}})
        console.log(user)
        if (!user) return response.status(400).json({
            status: 400,
            message: "Email atau Password salah"
        })

        if (!bcrypt.compareSync(password, user.password)) return response.status(400).json({
            status: 400,
            message: "Email atau Password salah"
        })

        if (user.isaktif === false) return response.status(400).json({
            status: 400,
            message: 'User belum melakukan verifikasi'
        })

        if (user.type === 'customer' && fcm_token) await user.update({fcm_token: fcm_token})
        else if (user.type === 'customer' && !fcm_token) return response.status(400).json({
            status: 400,
            errors: [
                '"fcm_token" required'
            ]
        })
        const userSchema = {};
        Object.keys(user.dataValues).forEach(value => {
            if (value !== "password") {
                userSchema[value] = user.dataValues[value]
            }
        })
        const token = signToken(userSchema)
        await Auth.create({user_id: user.user_id, token: token})

        response.status(200).json({
            status: 200,
            data: user.type === "customer" ? {
                access_token: token,
                fcm_token: user.fcm_token
            } : {access_token: token}
        })
    } catch (e) {
        console.log(e)
        response.status(500).json({
            status: 500,
            message: 'Internal server error'
        })
    }

}

async function register(request, response) {
    try {
        const {name, email, no_hp, password, fcm_token} = request.body
        const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10))
        const emailExist = await User.findOne({where: {email}})
        if (emailExist) return response.status(400).json({
            status: 400,
            message: 'User dengan email ini sudah ada'
        })
        const user = await User.create({
            name: name,
            email: email,
            no_hp: no_hp,
            password: hashedPassword,
            type: 'customer',
            fcm_token: fcm_token,
            isaktif: false,
            gender: 'LK'
        }, {returning: true})
        user.update({username: "customer" + moment(new Date()).format('DDMMYYYY') + `-${user.user_id}`})
        response.status(201).json({
            status: 201,
            message: 'Berhasil register user'
        })
        transporter.sendMail(mailOptions(user.email, 'Verification', 'verification', {
            name: user.name,
            url: process.env.APP_URL + "/auth/verification?token=" + Buffer.from(user.email).toString('base64')
        }), function (error, info) {
            if (error) {
                return console.log(error)
            }
            console.log('Message sent: ' + info.response)
        })
    } catch (e) {
        console.log(e)
        response.status(500).json({
            status: 500,
            message: 'Internal Server Error'
        })
    }
}

async function getUserProfile(request, response) {
    const user = {};
    Object.keys(response.locals.user.dataValues).forEach(value => {
        if (value !== "password") {
            if (value === "thumbnail") {
                user[value] = response.locals.user[value] !== null ? process.env.APP_URL + '/' + response.locals.user[value] : null
            } else {
                user[value] = response.locals.user[value]
            }
        }
    })
    return response.status(200).json({
        status: 200,
        data: user
    })
}

async function updateUser(request, response) {
    try {
        const user = await User.findByPk(response.locals.user.user_id)
        const file = request.file
        const {name, no_hp, address} = request.body
        if (!user) return response.status(400).json({
            status: 400,
            message: "User tidak ditemukan"
        })
        user.name = name
        user.no_hp = no_hp
        user.alamat = address
        if (file) {
            user.thumbnail = file.filename
        }
        await user.save()
        return response.status(200).json({
            status: 200,
            message: "Berhasil update"
        })
    } catch (e) {
        console.log(e)
        return response.status(500).json({
            status: 500,
            message: "Internal server error"
        })
    }
}

async function verification(request, response) {
    try {
        const {token} = request.query
        if (!token) return response.status(400).json({
            status: 400,
            message: 'Token dibutuhkan'
        })
        const user = await User.findOne({where: {email: atob(token)}})
        if (!user) return response.status(404).json({
            status: 404,
            message: 'User tidak ditemukan'
        })
        await user.update({isaktif: true})
        response.render('web/verification', {
            name: user.name,
            email: user.email,
            url: process.env.APP_URL
        })
    } catch (e) {
        console.log(e)
        response.status(500).json({
            status: 500,
            message: 'Internal Server Error'
        })
    }
}

async function sendForgotPasswordOtp(request, response) {
    const {email} = request.body
    const user = await User.findOne({where: {email}})
    if (user) {
        const forgotPassword = await ForgotPassword.findOne({user_id: user.user_id})
        if (forgotPassword) await forgotPassword.destroy()
        const code = (Math.random() * 1E9).toString().slice(0, 6)
        await ForgotPassword.create({user_id: user.user_id, code: code});
        transporter.sendMail(mailOptions(user.email, 'Forgot Passsword', 'forgot-password', {
            code: code,
        }), function (error, info) {
            if (error) {
                return console.log(error)
            }
            console.log('Message sent: ' + info.response)
        })
    }
    response.status(200).json({
        status: 200,
        message: 'Berhasil kirim otp'
    })
}

async function forgotPassword(request, response) {
    const {email, code, password} = request.body
    const user = await User.findOne({where: {email}})
    const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10))
    if (!user) return response.status(400).json({
        status: 400,
        message: 'Gagal untuk update password dikarenakan email tidak sesuai'
    })
    const forgotPassword = await ForgotPassword.findOne({where: {user_id: user.user_id, code}})
    if (!forgotPassword) return response.status(400).json({
        status: 400,
        message: 'Gagal untuk update password dikarenakan code tidak sesuai '
    })
    await user.update({password: hashedPassword})
    await forgotPassword.destroy()
    return response.status(200).json({
        status: 200,
        message: 'Berhasil ubah password'
    })
}

async function historyBooking(request, response) {
    const user = response.locals.user
    const {page} = request.query
    const bookings = await Booking.findAndCountAll({
        where: {user_id: user.user_id},
        include: {model: Fields, attributes: ['name']},
        attributes: ['booking_id','booking_time', 'booking_date', 'status_bayar', 'createdAt', 'day_price_quantity', 'night_price_quantity'],
        offset: page ? (page > 1 ? 5 * (page-1) : 0) : 0,
        limit: 5,
    })
    const data = schemaListBooking(bookings.rows)
    return response.status(200).json({
        status: 200,
        data: {
            item: data,
            total_item: data.length,
            total_all_item: bookings.count,
            current_page: page ? page : 1,
        }
    })
}

async function detailBookingUser(request, response) {
    const {booking_id} = request.params
    const user = response.locals.user
    const {dataValues: booking} = await Booking.findOne({
        where: {user_id: user.user_id, booking_id},
        include: {model: Fields, attributes: ['name'], include:  {model: Gallery}},
        attributes: [
            'day_price', 'night_price', 'total_price',
            'day_price_quantity', 'night_price_quantity', 'booking_date',
            'booking_time', 'status_bayar', 'platform_booking',
            'booking_payment_method_name', 'admin_price', 'tanggal_pembayaran'
        ]
    })
    if (!booking) return response.status(404).json({
        status: 404,
        message: "Booking tidak ditemukan"
    })
    const schema = {
        night_price: booking.night_price ? booking.night_price : undefined,
        day_price: booking.day_price ? booking.day_price : undefined,
        total_price: booking.total_price,
        admin_price: !booking.admin_price ? undefined : booking.admin_price,
        duration: !booking.day_price_quantity ? booking.night_price_quantity : booking.day_price_quantity,
        booking_date_time: getDateBasedFormat(addHourToDate(booking.booking_date, parseInt(booking.booking_time.split(":")[0])), 'DD MMM YYYY, HH:mm'),
        field_name: booking.Field.name,
        payment_method: booking.payment_method_name,
        tanggal_pembayaran: booking.tanggal_pembayaran ? getDateBasedFormat(booking.tanggal_pembayaran.getTime(), 'DD MMM YYYY, HH:mm') : null,
        verification_code: booking.booking_code,
        status_bayar: booking.status_bayar,
        virtual_account_code: booking.virtual_account_code,
    }
    if (booking.Field.Galleries.length > 0) {
        schema['image'] = process.env.APP_URL + '/' + booking.Field.Galleries.shift().image
    }
    response.status(200).json({
        status: 200,
        data: schema
    })
}

async function bookingActive(request, response) {
    const user = response.locals.user
    const waiting = await Booking.findOne({
        where: {user_id: user.user_id, status_bayar: "waiting"},
        include: {model: Fields, attributes: ['name']},
        order: [['createdAt', 'DESC']],
        attributes: ['booking_id','booking_time', 'booking_date', 'status_bayar', 'createdAt', 'day_price_quantity', 'night_price_quantity']
    })
    if (waiting) {
        return response.status(200).json({
            status: 200,
            data: schemaBooking(waiting.dataValues)
        })
    }
    const paid = await Booking.findOne({
        where: {user_id: user.user_id, status_bayar: "paid"},
        include: {model: Fields, attributes: ['name']},
        order: [['createdAt', 'DESC']],
        attributes: ['booking_id','booking_time', 'booking_date', 'status_bayar', 'createdAt', 'day_price_quantity', 'night_price_quantity']
    });
    if(paid) {
        if (new Date().getTime() < addHourToDate(paid.dataValues.booking_date, parseInt(paid.dataValues.booking_time.split(':')[0]))) {
            return response.status(200).json({
                status: 200,
                data: schemaBooking(paid.dataValues)
            })
        }
    }

    return response.status(200).json({
        status: 200,
        data: null
    })
}

const schemaListBooking = (bookings) => {
    return bookings.map(value => {
        const {dataValues: data} = value
        return schemaBooking(data)
    })
}

const schemaBooking = (data) => {
    return {
        booking_id: data.booking_id,
        name: data.Field.dataValues.name,
        booking_date_time: getDateBasedFormat(addHourToDate(data.booking_date, parseInt(data.booking_time.split(":")[0])), 'DD MMM YYYY, HH:mm'),
        duration: data.day_price_quantity === null ? data.night_price_quantity : data.day_price_quantity,
        status_bayar: data.status_bayar,
        created_at: getDateBasedFormat(data.createdAt.getTime(), 'DD MMM YYYY, HH:mm')
    }
}

module.exports = {
    login,
    register,
    verification,
    sendForgotPasswordOtp,
    forgotPassword,
    getUserProfile,
    updateUser,
    historyBooking,
    bookingActive,
    detailBookingUser,
    logout
}