'use strict'

const Review = require('../models/reviewModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

exports.setProductUserId = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.id
  if (!req.body.user) req.body.user = req.user.id
  next()
}

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find()

  res.status(200).json({ status: 'success', data: { reviews } })
})

exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id)

  if (!review) return next(new AppError('No review found with this ID', 404))

  res.status(200).json({ status: 'success', data: { review } })
})

exports.createReview = catchAsync(async (req, res, next) => {
  const newReview = await Review.create(req.body)

  res.status(201).json({
    status: 'success',
    data: { newReview }
  })
})

exports.updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  if (!review) return next(new AppError('No review found with this ID', 404))

  res.status(200).json({ status: 'success', data: { review } })
})

exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id)

  if (!review) return next(new AppError('No review found with this ID', 404))

  res.status(204).json({
    status: 'success',
    data: null
  })
})
