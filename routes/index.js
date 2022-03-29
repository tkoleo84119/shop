'use strict'

const express = require('express')
const router = express.Router()

const user = require('./modules/user')
const product = require('./modules/product')
const review = require('./modules/review')
const order = require('./modules/order')

router.use('/users', user)
router.use('/products', product)
router.use('/reviews', review)
router.use('/orders', order)

module.exports = router
