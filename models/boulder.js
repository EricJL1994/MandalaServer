const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const boulderSchema = new Schema({
    difficultyName: String,
    number: Number,
    dateValue: Number,
    holdColor: String,
    pending: Boolean,
    wall: Number,
    redpoints :{
        type : [mongoose.Types.ObjectID]
    },
    date: Date,
    image: String,
    league: {
      type: mongoose.Types.ObjectId,
      ref: 'league',
    },
})

const Boulder = mongoose.model("boulder", boulderSchema);

module.exports = Boulder;