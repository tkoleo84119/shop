'use strict'

const Order = require('../models/orderModel')
const catchAsync = require('../utils/catchAsync')

exports.createOrder = catchAsync(async (req, res, next) => {
  const { total } = req.body
  const order = await Order.create({ user: req.user.id, total })

  req.body.order = order // pass order to next step

  next()
})
