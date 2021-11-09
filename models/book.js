const mongoose = require("mongoose");
const BookSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'user',
  },

  name: {
    type: String,
    default: null,
  },

  trainingType: {
    type: String,
    enum: ['month', 'training', 'voucher', 'trainingVoucher'],
  }
})

const Book = mongoose.model("book", BookSchema)

module.exports = Book;