'use strict'

const express = require('express')
const router = express.Router({ mergeParams: true }) // To get productId

const reviewController = require('../../controllers/reviewController')
const authController = require('../../controllers/authController')

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.authStatus,
    authController.authRole('user'),
    reviewController.setProductUserId,
    reviewController.createReview
  )

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.authStatus,
    authController.authRole('user', 'admin'),
    reviewController.updateReview
  )

module.exports = router
