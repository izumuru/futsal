const adminAuthorization = (req, res, next) => {
    if(res.locals.user.type === 'admin') {
        return next();
    } else {
        return res.status(403).json({
            status: 403,
            message: 'User tidak memiliki akses'
        })
    }
}

module.exports = adminAuthorization