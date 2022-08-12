const mongoose = require("mongoose")
const Schema = mongoose.Schema

const LeagueBoulderSchema = new Schema({
  difficultyName: String,
  number: Number,
  holdColor: String,
  wall: Number,
  redpoints: {
    type: [mongoose.Types.ObjectId],
    ref: 'user'
  }
})

const LeagueBoulder = mongoose.model("leagueBoulder", LeagueBoulderSchema)

module.exports = LeagueBoulder