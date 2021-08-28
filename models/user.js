const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false,
  },
  admin: {
    type: Boolean,
    default: false,
  },
  canBook: {
    type: Boolean,
    default: false,
  },
});

UserSchema.methods.generateVerificationToken = function () {
  const user = this;

  const verificationToken = jwt.sign({ ID: user._id }, process.env.TOKEN, {
    expiresIn: "10m",
  });

  return verificationToken;
};
const User = mongoose.model("User", UserSchema);

module.exports = User;
