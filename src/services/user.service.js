const {User, Auth, ForgotPassword} = require("../models");
const bcrypt = require("bcrypt");
const {signToken} = require("../helpers/jwt");
const {transporter, mailOptions} = require("../helpers/mail");

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
        const token = signToken({email: user.email, user_id: user.user_id, type: user.type})
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
        const user = await User.create({
            name: name,
            email: email,
            no_hp: no_hp,
            password: hashedPassword,
            type: 'customer',
            fcm_token: fcm_token,
            isaktif: false
        }, {returning: true})
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

async function getUserProfile(request, response){
    const user = {};
    Object.keys(response.locals.user.dataValues).forEach(value => {
        if(value !== "password") {
            user[value] = response.locals.user[value]
        }
    })
    return response.status(200).json(user)
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
        if(forgotPassword) await forgotPassword.destroy()
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
    if(!forgotPassword) return response.status(400).json({
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

module.exports = {login, register, verification, sendForgotPasswordOtp, forgotPassword, getUserProfile}