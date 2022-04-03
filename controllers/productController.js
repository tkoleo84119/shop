'use strict'

const _ = require('lodash')
const multer = require('multer')
const sharp = require('sharp')
const imgur = require('imgur')

const Product = require('../models/productModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

const changeFeature = formValues => {
  if (Array.isArray(formValues.features)) return formValues

  formValues.features = formValues.features.split(',').map(feature => feature.trim())
  return formValues
}

const multerStorage = multer.memoryStorage()
const multerFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true)
  } else {
    cb(new AppError('This file is not image, please try again.', 400), false)
  }
}

const upload = multer({ storage: multerStorage, fileFilter: multerFileFilter })

exports.uploadProductImage = upload.single('image')

exports.resizeProductImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next()
  const fileName = `${req.body.name}.jpeg`

  req.file = await sharp(req.file.buffer)
    .resize(512, 256)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`temp/${fileName}`)

  next()
})

exports.createProduct = catchAsync(async (req, res, next) => {
  const { file } = req
  imgur.setClientId(process.env.IMGUR_CLIENT_ID)
  if (file) {
    const image = await imgur.uploadFile(`temp/${req.body.name}.jpeg`)
    req.body.image = image.link
  }

  const formValues = changeFeature(req.body)
  const product = await Product.create(formValues)

  res.status(201).json({ status: 'success', data: { product } })
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
  const { file } = req
  imgur.setClientId(process.env.IMGUR_CLIENT_ID)

  if (file) {
    const image = await imgur.uploadFile(`temp/${req.body.name}.jpeg`)
    req.body.image = image.link
  }

  const formValues = changeFeature(req.body)
  const product = await Product.findByIdAndUpdate(req.params.id, formValues, {
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
