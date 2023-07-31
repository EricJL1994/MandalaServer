const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: false,
    index: {
      unique: true,
      partialFilterExpression: {email: { $type: 'string'}},
    },
    default: null,
    // required: allowEmptyString,
    // unique: true,
  },
  password: {
    type: String,
    required: allowEmptyPassword,
  },
  date: {
    type: Date,
    default: Date.now(),
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

  permissions:{
    type: String,
    default: '{"days":0,"trainingDays":0}',
  },
});

function allowEmptyPassword(){
  return !(typeof this.password === 'string')
}

UserSchema.methods.getPermissions = function (){
  return JSON.parse(this.permissions)
}

UserSchema.methods.generateVerificationToken = function (){
  const user = this;

  const verificationToken = jwt.sign({ ID: user._id }, process.env.TOKEN, {
    expiresIn: "10m",
  });

  return verificationToken;
};

UserSchema.methods.generatePasswordHash = function (password, callback){
  const bcrypt = require("bcrypt");
  bcrypt.genSalt(10, (err, salt) =>
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) throw err;
        callback(hash)
      })
    )
}

UserSchema.methods.changePassword = function (password, callback){
  const bcrypt = require("bcrypt");
  bcrypt.genSalt(10, (err, salt) =>
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) throw err;
        this.password = hash
        this.save().then(value => callback(value))
      })
    )
}

const User = mongoose.model("user", UserSchema);

module.exports = User;
