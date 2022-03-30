const mongoose = require('mongoose')
const Product = require('../models/productModel')

const orderDetailSchema = new mongoose.Schema({
  order: {
    type: mongoose.ObjectId,
    ref: 'Order',
    required: [true, 'OrderDetail must belong to order']
  },
  product: {
    type: mongoose.ObjectId,
    ref: 'Product',
    required: [true, 'OrderDetail must belong to product']
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide a quantity'],
    default: 1
  }
})

orderDetailSchema.post('save', async function (result, next) {
  // decrease quantity after oderDetail create(payment is paid successfully)
  await Product.findByIdAndUpdate(result.product, { $inc: { quantity: -result.quantity } })
  next()
})

const OrderDetail = mongoose.model('OrderDetail', orderDetailSchema)
module.exports = OrderDetail
