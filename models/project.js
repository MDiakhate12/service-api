const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
    projectName: { type: String },              // "Nom Prjecet",
    applicationType: { type: String },          // "Development ,Big Data, ML",
    dependencies: { type: [String] },           // ["nginx", "node js express", "mongo db"],
    SLA: { type: Number },                      // "1h or 2h or 4h ",
    environment: { type: String },              // "dev prod",
    dataSize: { type: Number },                 // "i will ask to moussa for exact value",
    connectedApplications: { type: [String] },  // ["Agacy", "CRM" ],
    techRequirements: { type: [String] },       // ["network value", "bandwith"],
    costEstimation: { type: Number },          // "une valeur",
    provider: { type: String }                 // "une valeur",
});

const Project = mongoose.model('Projects', ProjectSchema);

module.exports = Project
