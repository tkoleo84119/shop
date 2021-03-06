'use strict'

const crypto = require('crypto')
const { promisify } = require('util')
const jwt = require('jsonwebtoken')

const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const Email = require('../utils/email')

const createAndSendToken = (user, statusCode, message, res) => {
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
  res.status(statusCode).json({ status: 'success', token, data: { user }, message })
}

exports.authStatus = catchAsync(async (req, res, next) => {
  let token

  // get token from header or cookie
  if (req.headers?.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt
  }

  if (!token) return next(new AppError('You are not logged in. Please log in to get access', 401))

  // check token validity
  const payload = await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY)

  // check if user still exist
  const currentUser = await User.findById(payload.id).select('_id name email phone address role')
  if (!currentUser) return next(new AppError('The User is no logger exist', 401))

  // check if user change password after token issued
  if (currentUser.checkPasswordChange(payload.iat))
    return next(new AppError('User recently changed password. Please log in again', 401))

  // pass currentUser to next route
  req.user = currentUser
  next()
})

exports.authRole =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new AppError('You do not have permission to do this action'))

    next()
  }

exports.signUp = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, role } = req.body
  await User.create({ name, email, password, passwordConfirm, role })

  res.status(201).json({
    status: 'success',
    message: 'Create Account successfully'
  })
})

exports.signIn = catchAsync(async (req, res, next) => {
  // check if email & password exist
  const { email, password } = req.body
  if (!email || !password) return next(new AppError('Please provide your email and password', 400))

  // check if email & password correct
  const user = await User.findOne({ email })
    .select('_id name email phone address role')
    .select('+password')
  if (!user || !(await user.checkPassword(password, user.password)))
    return next(new AppError('Incorrect email or password', 401))

  // send token to client
  createAndSendToken(user, 200, 'Login successfully', res)
})

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email })
  if (!user) return next(new AppError('There is no user with this email address', 404))

  const resetToken = user.createPasswordResetToken()
  await user.save({ validateBeforeSave: false })

  // send reset password email to client
  try {
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
    await new Email(user, resetURL).sendPasswordReset()

    res.status(200).json({
      status: 'success',
      message: 'The password reset email has been sent to your email address.'
    })
  } catch (err) {
    user.passwordRestToken = undefined
    user.passwordResetExpires = undefined
    await user.save({ validateBeforeSave: false })

    return next(new AppError('There was an error when sending email, please try it again!', 500))
  }
})

exports.resetPassword = catchAsync(async (req, res, next) => {
  // get user base on resetToken
  const passwordResetToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
  const user = await User.findOne({ passwordResetToken, passwordResetExpires: { $gt: Date.now() } })

  // If token not yet expired, user set new password
  if (!user) return next(new AppError('Token has invalid or expired.', 400))

  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  user.passwordRestToken = undefined
  user.passwordResetExpires = undefined
  await user.save()

  res.status(200).json({ status: 'success' })
})

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password')

  const { passwordCurrent, password, passwordConfirm } = req.body

  if (!passwordCurrent) return next(new AppError('Please provide your current password', 400))

  // check current password is correct
  if (!(await user.checkPassword(passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401))
  }

  // update password
  user.password = password
  user.passwordConfirm = passwordConfirm
  await user.save()

  // send token to client
  createAndSendToken(user, 200, 'Update password successfully', res)
})
