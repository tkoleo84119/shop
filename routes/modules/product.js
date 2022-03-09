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

router
  .route('/:id')
  .get(productController.getProduct)
  .patch(
    authController.authStatus,
    authController.authRole('admin'),
    productController.updateProduct
  )
  .delete(
    authController.authStatus,
    authController.authRole('admin'),
    productController.deleteProduct
  )

module.exports = router
