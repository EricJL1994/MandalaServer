const mongoose = require('mongoose');
const InfoSchema  = new mongoose.Schema({
  tittle :{
      type  : String,
      required : true
  } ,
  description :{
    type  : String,
    required : true
  } ,
  date :{
    type : Date,
    default : Date.now
  }
});

const Info= mongoose.model('Info', InfoSchema);

module.exports = Info;