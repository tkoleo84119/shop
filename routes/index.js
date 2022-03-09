'use strict'

const express = require('express')
const router = express.Router()

const user = require('./modules/user')
const product = require('./modules/product')

router.use('/users', user)
router.use('/products', product)

module.exports = router
