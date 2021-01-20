const mongoose = require('mongoose')

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const VmInstanceSchema = new Schema({
    name: { type: String },
    cpu: { type: Number, default: 1 },
    memory: { type: Number, default: 2048 },
    disk: { type: Number, default: 100 },
    os: { type: ObjectId, ref: "osImage" },
    osType: { type: String, default: "Debian" },
    osImage: { type: String, default: "Ubuntu 20.04" }
});

const VmInstance = mongoose.model('vmInstances', VmInstanceSchema);

module.exports = VmInstance
