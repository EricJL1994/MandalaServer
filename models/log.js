const mongoose = require("mongoose");
const LogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'user',
  },

  date: {
    type: Date,
    default: new Date(),
  },

  request: {
    type: String,
  }
})

const Log = mongoose.model('log', LogSchema)

module.exports = Log;