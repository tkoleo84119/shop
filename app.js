'use strict'

const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const cookieParser = require('cookie-parser')
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const route = require('./routes/index')
const globalErrorHandler = require('./controllers/errorController')
const orderController = require('./controllers/orderController')

const app = express()
const port = process.env.PORT || 3000
const DB_URL = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD)

// connect to database
mongoose.connect(DB_URL).then(() => console.log('Connected to database successfully'))

// Set security HTTP header
app.use(helmet())

// Development logging
if (process.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

// Limit req/min on same req
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again one hour later.'
})
app.use(limiter)

// Body parser
app.use(express.json({ limit: '10kb', verify: (req, res, buffer) => (req.rawBody = buffer) }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(cookieParser())

// Data sanitization against NoSQL query injection
app.use(mongoSanitize())

// Data sanitization against XSS
app.use(xss())

// Route for stripe webhooks
app.post('/webhook', cors(), orderController.webhook)

// CORS settings
const whitelist = [process.env.FRONTEND_URL, 'http://localhost:8000']
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

// Routes
app.use('/api/v1', cors(corsOptions), route)

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
