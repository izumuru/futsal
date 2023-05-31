const express = require('express')
const router = express.Router()
const {income, rentTime} = require('../services/dashboard.service')

router.get('/income', income)
router.get('/rent-time', rentTime)
module.exports = router