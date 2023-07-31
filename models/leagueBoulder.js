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
  },
  image: String,
})

LeagueBoulderSchema.statics.formLeagueBoulder = async (boulder, callback) => {
  return LeagueBoulder.create({
    difficultyName: boulder.difficultyName,
    number: boulder.number,
    holdColor: boulder.holdColor,
    wall: boulder.wall,
  }).then(leagueBoulder => callback(leagueBoulder))

}

const LeagueBoulder = mongoose.model("leagueBoulder", LeagueBoulderSchema)

module.exports = LeagueBoulder