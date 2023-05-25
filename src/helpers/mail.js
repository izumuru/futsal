const hbs = require('nodemailer-express-handlebars')
const nodemailer = require('nodemailer')
const path = require('path')

// initialize nodemailer
const transporter = nodemailer.createTransport(
    {
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        ssl: false,
        tls: true,
        auth:{
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD
        }
    }
);

// point to the template folder
const handlebarOptions = {
    viewEngine: {
        partialsDir: path.resolve('../views/'),
        defaultLayout: false,
    },
    viewPath: path.resolve('../views/'),
};

// use a template file with nodemailer
transporter.use('compile', hbs(handlebarOptions))

const mailOptions = (to, subject, template, context) => {
    return {
        from: '"Adebola" <futsal-noreply@gmail.com>', // sender address
        to: to, // list of receivers
        subject: subject,
        template: template, // the name of the template file i.e email.handlebars
        context: context
    }
}

module.exports = {mailOptions, transporter}