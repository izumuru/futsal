const express = require('express')

const router = express.Router()
const validator = require('express-joi-validation').createValidator({
    passError: true
})

module.exports = { router, validator }