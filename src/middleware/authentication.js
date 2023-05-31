const { verifyToken } = require("../helpers/jwt");
const { User, Auth } = require("../models");

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
            const authToken = await Auth.findOne({where: {user_id: result.user_id, token}})
            // console.log(authToken)
            if(!authToken.is_valid) throw new Error("Token Invalid")
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
        console.log(error.name)
        if(error.name === 'TokenExpiredError') {
            return res.status(401).json({status: 401, message: 'Token Expired'})
        }
        if(error.message === "Token Invalid") return res.status(401).json({status: 401, message: 'Token Invalid'})
        return res.status(500).json({
            status: 500,
            message: 'Terjadi kesalahan pada server'
        })
    }
}

module.exports = authentication;