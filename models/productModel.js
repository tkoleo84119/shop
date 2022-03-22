const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide product's name"],
      trim: true
    },
    category: {
      type: String,
      required: [true, "Please provide product's category"],
      enum: ['Cameras', 'Headphones', 'Laptops', 'Microphone', 'Smartphones', 'Other'],
      default: 'Other'
    },
    features: [String],
    images: [String],
    description: {
      type: String,
      maxLength: [500, "The product's description must be less than 200 characters"]
    },
    quantity: {
      type: Number,
      required: [true, "Please provide product's quantity"],
      min: [0, "The product's quantity must more than 0"]
    },
    price: {
      type: Number,
      required: [true, "Please provide product's price"],
      min: [0, "The product's price must more than 0"]
    },
    ratingsAverage: {
      type: Number,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: val => Math.round(val * 10) / 10 // run every time
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now()
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product', // in reviewSchema's name
  localField: '_id'
})

const Product = mongoose.model('Product', productSchema)
module.exports = Product
