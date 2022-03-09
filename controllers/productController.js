'use strict'

const Product = require('../models/productModel')
const catchAsync = require('../utils/catchAsync')

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find()
  res.status(200).json({ status: 'success', data: { products } })
})
