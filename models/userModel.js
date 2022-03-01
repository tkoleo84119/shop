const crypto = require('crypto')
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please provide your password'],
    minlength: 8,
    select: false // the password can't pass to client
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (value) {
        return value === this.password
      },
      message: 'The PasswordConfirm is not equal to password'
    }
  },
  passwordRestToken: String,
  passwordChangedAt: Date,
  passwordResetExpires: Date
})

userSchema.pre('save', async function (next) {
  // only run this function when password actually pass to modified
  if (!this.isModified('password')) return next()

  this.password = await bcrypt.hash(this.password, 12)
  this.passwordConfirm = undefined // passwordConfirm only use to validate password

  next()
})

userSchema.method('checkPassword', async (candidatePassword, userPassword) => {
  return await bcrypt.compare(candidatePassword, userPassword)
})

userSchema.method('createPasswordResetToken', () => {
  // generate restToken => this will be sent to client
  const restToken = crypto.randomBytes(32).toString('hex')

  // hash restToken => this will be store in database
  this.passwordRestToken = crypto.createHash('sha256').update(restToken).digest('hex')

  // resetToken only available in 10min
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000

  return restToken
})

const User = mongoose.model('User', userSchema)
module.exports = User
