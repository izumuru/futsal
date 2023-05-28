const opadminAuthorization = (req, res, next) => {
    if(res.locals.user.type === 'admin' || res.locals.user.type === 'operator') {
        return next();
    } else {
        return res.status(403).json({
            status: 403,
            message: 'User tidak memiliki akses'
        })
    }
}

module.exports = opadminAuthorization