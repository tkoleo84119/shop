'use strict'

const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const route = require('./routes/index')
const globalErrorHandler = require('./controllers/errorController')

const app = express()
const port = process.env.PORT || 3000
const DB_URL = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD)

// connect to database
mongoose.connect(DB_URL).then(() => console.log('Connected to database successfully'))

// Body parser
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(cookieParser())

// Development logging
if (process.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

// Routes
app.use('/api/v1', route)

// Error middleware(all error in express will pass to here)
app.use(globalErrorHandler)

const server = app.listen(port, () => console.log(`The app is listening on port ${port}`))

// handle uncaughtException Error
process.on('uncaughtException', err => {
  console.log('UncaughtException Error')
  console.log(err.name, err.message)
  process.exit(1)
})

// handle unhandledRejection Error
process.on('unhandledRejection', err => {
  console.log('unhandledRejection Error')
  console.log(err.name, err.message)
  server.close(() => process.exit(1)) // server needs some time to deal with the remaining request
})
