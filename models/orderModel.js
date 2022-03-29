const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.ObjectId,
    ref: 'User',
    required: [true, 'Order must belong to user']
  },
  products: [
    {
      type: mongoose.ObjectId,
      ref: 'OrderDetail'
    }
  ],
  total: {
    type: Number,
    required: [true, 'Please provide total price'],
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

const Order = mongoose.model('Order', orderSchema)
module.exports = Order
