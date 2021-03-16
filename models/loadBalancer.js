const mongoose = require('mongoose')

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const LoadBalancerSchema = new Schema({
    name: { type: String },
    projectId: { type: Schema.Types.ObjectId, ref: 'Projects' },
    IPAddress: { type: String },
    frontend: {
        privateIP: { type: String },
        publicIP: { type: String },
    },
    backend: {
        privateIP: { type: String },
        publicIP: { type: String },
    },

});

const LoadBalancer = mongoose.model('loadBalancers', LoadBalancerSchema);

module.exports = LoadBalancer
