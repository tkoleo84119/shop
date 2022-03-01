const path = require('path')
const pug = require('pug')
const nodemailer = require('nodemailer')
const { htmlToText } = require('html-to-text')

module.exports = class Email {
  constructor(user, url) {
    this.from = `Just <${process.env.EMAIL_FROM}>`
    this.to = user.email
    this.name = user.name
    this.url = url
  }

  transporter() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })
  }

  async send(template, subject) {
    // render html base on pug template
    const html = pug.renderFile(path.join(__dirname, `../views/emails/${template}.pug`), {
      subject,
      name: this.name,
      url: this.url
    })

    const emailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: htmlToText(html),
      html
    }

    // create and send email
    await this.transporter().sendMail(emailOptions)
  }

  async sendPasswordReset() {
    await this.send('passwordRest', 'Password reset email(only valid for 10min)')
  }
}
