const express = require("express");
const bodyParser = require('body-parser')
require('dotenv').config()
const fs = require('fs');
const path = require('path')
const authRouter = require('./routes/auth.route');
const userRouter = require('./routes/user.route')

const app = express();
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.use(express.static('public'))

//router
app.use('/auth', authRouter)
app.use('/user', userRouter)

if(!fs.existsSync(path.join(__dirname, '../public'))) {
    fs.mkdirSync(path.join(__dirname, '../public'))
}

app.listen(process.env.PORT, () => {
    console.log(`App listening at http://localhost:${process.env.PORT}`);
});