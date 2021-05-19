const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const boulderSchema = new Schema({
    dificultyName: String,
    number: Number,
    dateValue: Number,
    holdColor: String,
    pending: Boolean,
    intersectionsName: Array,
    wall: Number
})

const Boulder = mongoose.model("Boulder", boulderSchema);

module.exports = Boulder;