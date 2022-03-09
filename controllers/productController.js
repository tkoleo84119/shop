'use strict'

const Product = require('../models/productModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find()

  res.status(200).json({ status: 'success', data: { products } })
})

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
  if (!product) return next(new AppError('No document found with this ID', 404))

  res.status(200).json({ status: 'success', data: { product } })
})
