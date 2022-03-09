'use strict'

const express = require('express')
const router = express.Router()

const productController = require('../../controllers/productController')
const authController = require('../../controllers/authController')

router
  .route('/')
  .get(productController.getAllProducts)
  .post(
    authController.authStatus,
    authController.authRole('admin'),
    productController.createProduct
  )

router.route('/:id').get(productController.getProduct)

module.exports = router
