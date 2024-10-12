const mongoose = require('mongoose')

const exerciseSchema = mongoose.Schema({
    username: String,
    description: {
        type: String,
        require: true
    },
    duration: {
        type: Number,
        require: true
    },
    date: Date,
})

module.exports = mongoose.model("Exercise", exerciseSchema)