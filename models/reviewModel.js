const mongoose = require('mongoose')
const Product = require('./productModel')

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
  rating: {
    type: Number,
    required: [true, 'A review must have a rating'],
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating must be below 5.0']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
})

// When review create, update and delete => run calcAverageRatings to update product's rating
reviewSchema.static('calcAverageRatings', async function (productId) {
  const status = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: { _id: '$product', ratingsAverage: { $avg: '$rating' }, ratingsQuantity: { $sum: 1 } }
    }
  ])

  const { ratingsAverage, ratingsQuantity } = status[0]
  await Product.findByIdAndUpdate(productId, { ratingsAverage, ratingsQuantity })
})

reviewSchema.post('save', function (result) {
  Review.calcAverageRatings(result.product)
})

reviewSchema.post('findOneAndUpdate', function (result) {
  Review.calcAverageRatings(result.product)
})

reviewSchema.post('findOneAndDelete', function (result) {
  Review.calcAverageRatings(result.product)
})

const Review = mongoose.model('Review', reviewSchema)
module.exports = Review
