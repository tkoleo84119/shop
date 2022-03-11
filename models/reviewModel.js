const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'The content is not allow to be empty']
  },
  user: {
    type: mongoose.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to user']
  },
  product: {
    type: mongoose.ObjectId,
    ref: 'Product',
    required: [true, 'Review must belong to product']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
})

const Review = mongoose.model('Review', reviewSchema)
module.exports = Review
