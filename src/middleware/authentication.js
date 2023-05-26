const { verifyToken } = require("../helpers/jwt");
const { User } = require("../models");

const authentication = async (req, res, next) => {
    try {
        const token = req.headers['token'];
        if (!token) {
            res.status(400).json({
                status: 400,
                message: 'Header token dibutuhkan'
            })
            return
        } else {
            const result = verifyToken(token);
            const user = await User.findByPk(result.user_id);
            if (user.email === result.email) {
                res.locals.user = user
                return next()
            }
            res.status(400).json({
                status: 400,
                message: 'Kredensial tidak valid'
            })
            return
        }
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Terjadi kesalahan pada server'
        })
    }
}

module.exports = authentication;