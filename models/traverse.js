const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const traverseSchema = new Schema({
    dificultyName: String,
    number: Number,
    dateValue: Number,
    holdColor: String,
    pending: Boolean,
    intersectionsName: Array,
    wall: Number
})

const Traverse = mongoose.model("Traverse", traverseSchema);

module.exports = Traverse;