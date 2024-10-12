const mongoose = require('mongoose')

const urlSchema = new mongoose.Schema({
    original_url: {
        type: String,
        unique: true,
        require: true
    },
    short_url: {
        type: String,
        unique: true
    }
})

module.exports = mongoose.model("Url", urlSchema)