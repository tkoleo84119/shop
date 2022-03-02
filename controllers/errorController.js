'use strict'
const AppError = require('../utils/appError')

const castErrorDB = ({ errors }) => {
  const key = Object.keys(errors)[0]
  const message = `Invalid data type of ${errors[key].path}: '${errors[key].value}'. Please use another value`
  return new AppError(message, 400)
}

const duplicateFieldDB = ({ keyValue }) => {
  const [key, value] = Object.entries(keyValue)[0]
  const message = `Duplicate ${key}: '${value}'. Please use another value`
  return new AppError(message, 400)
}

const validatorErrorDB = ({ errors }) => {
  const errorMessages = Object.values(errors).map(err => err.message)
  const message = errorMessages.join(' & ') // use '&' to connect different validatorError form DB
  return new AppError(message, 400)
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  // handle errors from the DB
  if (err.name === 'MongoServerError' && err.code === 11000) err = duplicateFieldDB(err)
  if (err.name === 'ValidationError') err = validatorErrorDB(err)
  if (err.name === 'ValidationError' && err.errors[Object.keys(err.errors)[0]].name === 'CastError')
    err = castErrorDB(err)

  if (err.isOperational)
    // Operational Error or Trusted Error => send to client
    return res.status(err.statusCode).json({ status: err.status, message: err.message })

  // Programming Error or unknown Error => don't leak error detail
  console.error('Error', err)
  return res.status(500).json({ status: 'error', message: 'Something wrong' })
}
