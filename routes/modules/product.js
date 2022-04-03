'use strict'

const express = require('express')
const router = express.Router()

const review = require('./review')
const productController = require('../../controllers/productController')
const authController = require('../../controllers/authController')

// pass productId to review routes
router.use('/:id/reviews', review)

router
  .route('/')
  .get(productController.getAllProducts)
  .post(
    authController.authStatus,
    authController.authRole('admin'),
    productController.uploadProductImage,
    productController.resizeProductImage,
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
