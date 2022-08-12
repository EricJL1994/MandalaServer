const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const traverseSchema = new Schema({
    difficultyName: String,
    number: Number,
    dateValue: Number,
    holdColor: String,
    pending: Boolean,
    intersectionsName: Array,
    wall: Number
})

const Traverse = mongoose.model("traverse", traverseSchema);

module.exports = Traverse;