const mongoose = require('mongoose')

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

const OrderDetail = mongoose.model('OrderDetail', orderDetailSchema)
module.exports = OrderDetail
