const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
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
  createdAt: {
    type: Date,
    default: Date.now()
  }
})

const Product = mongoose.model('Product', productSchema)
module.exports = Product
