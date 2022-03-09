'use strict'
const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const User = require('../models/userModel')
const Product = require('../models/productModel')
require('dotenv').config()

const DB_URL = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD)

// connect to database
mongoose.connect(DB_URL).then(() => console.log('Connected to database successfully'))

// Read data from file
const users = JSON.parse(fs.readFileSync(path.join(__dirname, 'users.json')))
const product = JSON.parse(fs.readFileSync(path.join(__dirname, 'products.json')))

// Import data to DB
const importData = async () => {
  try {
    await User.create(users)
    await Product.create(product)
    console.log('create data success!')
  } catch (err) {
    console.log(err)
  }
  process.exit()
}

// Delete data from DB
const deleteData = async () => {
  try {
    await User.deleteMany()
    await Product.deleteMany()
    console.log('delete data success!')
  } catch (err) {
    console.log(err)
  }
  process.exit()
}

// Use command-line arguments to determine which action will be executed
if (process.argv[2] === '--import') {
  importData()
}
if (process.argv[2] === '--delete') {
  deleteData()
}
