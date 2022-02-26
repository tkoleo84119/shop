'use strict'

const jwt = require('jsonwebtoken')

const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

const createAndSendToken = (user, statusCode, res) => {
  // let user can't receive private data
  user.password = undefined

  // create a token
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })

  // set cookie options to pass tokens
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 3600 * 1000),
    httpOnly: true
  }
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true
  }

  // send token to client
  res.cookie('jwt', token, cookieOptions)
  res.status(statusCode).json({ status: 'success', token, data: { user } })
}

exports.signUp = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, role } = req.body
  const newUser = await User.create({ name, email, password, passwordConfirm, role })

  createAndSendToken(newUser, 201, res)
})

exports.signIn = catchAsync(async (req, res, next) => {
  // check if email & password exist
  const { email, password } = req.body
  if (!email || !password) return next(new AppError('Please provide your email and password', 400))

  // check if email & password correct
  const user = await User.findOne({ email }).select('+password')
  if (!user || !(await user.checkPassword(password, user.password)))
    return next(new AppError('Incorrect email or password', 401))

  // send token to client
  createAndSendToken(user, 200, res)
})
