'use strict'

const express = require('express')
const router = express.Router()

const user = require('./modules/user')
const product = require('./modules/product')
const review = require('./modules/review')

router.use('/users', user)
router.use('/products', product)
router.use('/reviews', review)

module.exports = router
