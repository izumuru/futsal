const express = require("express");
const bodyParser = require('body-parser')
require('dotenv').config()
const fs = require('fs');
const path = require('path')
const cors = require('cors')
const authRouter = require('./routes/auth.route');
const userRouter = require('./routes/user.route')
const fieldRouter = require('./routes/field.route')
const bookingRouter = require('./routes/booking.route')
const paymentRouter = require('./routes/payment.route')
const authentication = require('./middleware/authentication')
const {midtransCallback} = require("./services/booking.service");

const app = express();
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())

// parse application/json
app.use(bodyParser.json())
app.use(express.static('public'))

//router
app.use('/auth', authRouter)
app.post('/midtrans-callback', midtransCallback)

app.use(authentication)
app.use('/user', userRouter)
app.use('/bookings', bookingRouter)
app.use('/fields', fieldRouter)
app.use('/payments', paymentRouter)

app.use((err, req, res, next) => {
    if(err && err.error && err.error.isJoi) {
        res.status(422).json({
            status: 422,
            errors: err.error.details.map(value => value.message)
        })
    } else {
        next(err)
    }
})

if(!fs.existsSync(path.join(__dirname, '../public'))) {
    fs.mkdirSync(path.join(__dirname, '../public'))
}

app.listen(process.env.PORT, () => {
    console.log(`App listening at http://localhost:${process.env.PORT}`);
});