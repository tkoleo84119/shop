const mongoose = require('mongoose')
const OrderDetail = require('../models/orderDetailModel')

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.ObjectId,
    ref: 'User',
    required: [true, 'Order must belong to user']
  },
  products: [
    {
      type: mongoose.ObjectId,
      ref: 'Product'
    }
  ],
  orderDetails: [
    {
      type: mongoose.ObjectId,
      ref: 'OrderDetail'
    }
  ],
  subTotal: {
    type: Number,
    required: [true, 'Please provide subTotal price'],
    min: [0, 'The total price must be more than 0']
  },
  deliveryFee: {
    type: Number,
    required: [true, 'Please provide delivery fee'],
    min: [0, 'The total price must be more than 0']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  paid: {
    type: Boolean,
    default: false
  }
})

orderSchema.post('findOneAndDelete', async function (result, next) {
  await OrderDetail.deleteMany({ order: result._id })
  next()
})

const Order = mongoose.model('Order', orderSchema)
module.exports = Order
