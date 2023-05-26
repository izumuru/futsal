const multer = require("multer");

const multerWithErrorHandling = (userFunction, req, res, next) => {
    userFunction(req, res, (err) => {
        if(err instanceof multer.MulterError) {
            console.log(err)
            res.status(400).json({
                status: 400,
                message: 'Upload gambar gagal'
            })
        } else if(err) {
            console.log(err)
            res.status(500).json({
                status: 500,
                message: 'Internal server error'
            })
        } else {
            next()
        }
    })

}

module.exports = { multerWithErrorHandling }