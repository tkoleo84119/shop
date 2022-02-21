'use strict'

const express = require('express')
const mongoose = require('mongoose')
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const app = express()
const port = process.env.PORT || 3000
const DB_URL = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD)

// connect to database
mongoose.connect(DB_URL).then(() => console.log('Connected to database successfully'))

app.get('/', (req, res) => {
  res.send('hello world')
})

const server = app.listen(port, () => console.log(`The app is listening on port ${port}`))
