const mongoose = require('mongoose')

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const LoadBalancerSchema = new Schema({
    name: { type: String },
    projectId: { type: Schema.Types.ObjectId, ref: 'Projects' },
    IPAddress: { type: String },
    loadBalancingScheme: { type: String },
    instanceTemplate: {
        cpu: { type: String },
        memory: { type: String },
        disk: { type: String },
        osType: { type: String },
        osImage: { type: String },
    }
});

const LoadBalancer = mongoose.model('loadBalancers', LoadBalancerSchema);

module.exports = LoadBalancer
