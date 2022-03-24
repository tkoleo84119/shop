'use strict'

const _ = require('lodash')

const Product = require('../models/productModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

exports.createProduct = catchAsync(async (req, res, next) => {
  const newProduct = await Product.create(req.body)

  res.status(201).json({ status: 'success', data: { newProduct } })
})

const filter = query => {
  const filterQuery = _.omit(query, ['page', 'limit', 'pageResults'])

  if (query.name) {
    filterQuery.name = { $regex: query.name, $options: 'i' }
  }

  return filterQuery
}

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const skip = (req.query.page - 1) * req.query.pageResults
  const filterQuery = filter(req.query)
  const products = await Product.find(filterQuery).skip(skip).limit(req.query.limit)

  res.status(200).json({ status: 'success', data: { products } })
})

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate('reviews')
  if (!product) return next(new AppError('No product found with this ID', 404))

  res.status(200).json({ status: 'success', data: { product } })
})

exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  if (!product) return next(new AppError('No product found with this ID', 404))

  res.status(200).json({ status: 'success', data: { product } })
})

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id)
  if (!product) return next(new AppError('No product found with this ID', 404))

  res.status(204).json({ status: 'success', data: null })
})
