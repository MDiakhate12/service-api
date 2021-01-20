const mongoose = require('mongoose')

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const VmInstance = new Schema({
    name: { type: String },
    cpu: { type: Number, default: 1 },
    ram: { type: Number, default: 2048 },
    disk: { type: Number, default: 100 },
    os: { type: ObjectId, ref: "osImage" },
});

module.exports = mongoose.model('vmInstance', VmInstance);
