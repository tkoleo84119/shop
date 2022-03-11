'use strict'

const Review = require('../models/reviewModel')
const catchAsync = require('../utils/catchAsync')

exports.setProductUserId = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.id
  if (!req.body.user) req.body.user = req.user.id
  next()
}

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find()

  res.status(200).json({ status: 'success', data: { reviews } })
})

exports.createReview = catchAsync(async (req, res, next) => {
  const newReview = await Review.create(req.body)

  res.status(201).json({
    status: 'success',
    data: { newReview }
  })
})
