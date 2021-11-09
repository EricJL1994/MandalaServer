const mongoose = require("mongoose");
const BookDateSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
  },

  month: {
    type: Number,
    required: true,
  },

  day: {
    type: Number,
    required: true,
  },

  bookMorning: {
    type: [mongoose.Types.ObjectID],
    validate: [arrayLimit, "{PATH} exceeds the limits"],
    // ref: 'user',
    ref: 'book',
  },

  bookEvening: {
    type: [mongoose.Types.ObjectID],
    validate: [arrayLimit, "{PATH} exceeds the limits"],
    // ref: 'user',
    ref: 'book',
  },

  bookNight: {
    type: [mongoose.Types.ObjectID],
    validate: [arrayLimit, "{PATH} exceeds the limits"],
    // ref: 'user',
    ref: 'book',
  },

  bookOpen: {
    type: [Boolean],
    default: [true, true, true],
  },
});

// BookDateSchema.index({year:1, month:1, day:1}, {unique: true})
function arrayLimit(val) {
  return val.length <= process.env.CAPACITY;
}

const BookDate = mongoose.model("bookDate", BookDateSchema);

module.exports = BookDate;
