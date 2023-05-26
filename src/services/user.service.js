const {User, Auth} = require("../models");
const bcrypt = require("bcrypt");
const {signToken} = require("../helpers/jwt");
const {transporter, mailOptions} = require("../helpers/mail");
const storage = require("../helpers/file_upload");

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

        if(user.isaktif === false) return response.status(400).json({
            status: 400,
            message: 'User belum melakukan verifikasi'
        })

        if(user.type === 'customer' && fcm_token) await user.update({fcm_token: fcm_token})
        else if(user.type === 'customer' && !fcm_token) return response.status(400).json({
            status: 400,
            errors: [
                '"fcm_token" required'
            ]
        })
        const token = signToken({email: user.email, user_id: user.user_id})
        await Auth.create({user_id: user.user_id, token: token})

        response.status(200).json({
            status: 200,
            data: {
                access_token: token
            }
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

module.exports = {login, register, verification}