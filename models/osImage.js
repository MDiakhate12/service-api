const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const osImage = new Schema({
    type: { type: String, default: "Debian" },
    image: { type: String, default: "Ubuntu 20.04" }
});

module.exports = mongoose.model('osImage', osImage);
