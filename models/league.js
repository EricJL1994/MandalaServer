const mongoose = require("mongoose")
const LeagueSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },

  boulders: {
    type: [mongoose.Types.ObjectID],
    ref: 'leagueBoulder',
  },
})

const League = mongoose.model("league", LeagueSchema)

module.exports = League