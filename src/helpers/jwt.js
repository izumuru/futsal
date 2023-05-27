require('dotenv').config()
const jwt = require("jsonwebtoken");
const fs = require('fs');

const signToken = (object) => {
    return jwt.sign(object, process.env.APP_KEY, {expiresIn: '360d'});
};

const verifyToken = (access_token) => {
    return jwt.verify(access_token,  process.env.APP_KEY);
};

module.exports = {
    signToken,
    verifyToken,
};