const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");
const jwt = require("jsonwebtoken");
let transporter = nodemailer.createTransport(
  smtpTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  })
);
function sendMail(to, subject, html){
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: to, //from req.body.to
    subject: subject, //from req.body.subject
    html: html, //from req.body.message
  };
  //delivery
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) console.log(error)
    console.log(info)
  });
}
exports.sendMail = (to, subject, message) => {
  sendMail(to, subject, message)
  // const mailOptions = {
  //   from: process.env.GMAIL_USER,
  //   to: to, //from req.body.to
  //   subject: subject, //from req.body.subject
  //   html: message, //from req.body.message
  // };
  // //delivery
  // transporter.sendMail(mailOptions, function (error, info) {
  //   if (error) console.log(error)
  //   console.log(info)
  // });
}

exports.welcomeMail = async (user) => {
  const pug = require("pug")
  const html = pug.renderFile(__dirname + "/../views_pug/email/header.pug", {user, body: 'welcome'})
  sendMail(user.email, "Bienvenido a Mandala Climb", html)
  // return html
}

exports.recoveryMail = async (user, password) => {
  const pug = require("pug")
  const html = pug.renderFile(__dirname + "/../views_pug/email/header.pug", {user, body: 'recovery', password})
  sendMail(user.email, "Recuperación de contraseña", html)
  // return html

}

exports.verificationMail = async (user, link) => {
  const pug = require("pug")
  const html = pug.renderFile(__dirname + "/../views_pug/email/header.pug", {user, body: 'verification', link})
  sendMail(user.email, "Validación de email", html)
  // return html
}