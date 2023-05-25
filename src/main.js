const express = require("express");
var bodyParser = require('body-parser')
require('dotenv').config()
const fs = require('fs');
const userRouter = require('./routes/user.route');

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//router
app.use('/auth', userRouter);

app.listen(process.env.PORT, () => {
    console.log(`App listening at http://localhost:${process.env.PORT}`);
});