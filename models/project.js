const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ProjectSchema = new Schema(
  {
    projectName: { type: String },
    applicationType: { type: String },
    dependencies: { type: [String] },
    SLA: { type: String },
    environment: { type: String },
    stack: { type: String },
    connectedApplications: { type: [String] },
    costEstimation: { type: Number },
    cpu: { type: String },
    disk: { type: String },
    memory: { type: String },
    numberOfVm: { type: String },
    osImage: { type: String },
    osType: { type: String },
    publicIP: { type: String },
    provider: { type: String },
    projectArchitecture: { type: String },
    frontendOptions: {
      project_repository: { type: String },
    },
    backendOptions: {
      db_uri: { type: String },
      port: { type: Number },
      main_file: { type: String },
      project_repository: { type: String },
      jar_url: { type: String },
    },
  },
  { timestamps: true }
);

const Project = mongoose.model("Projects", ProjectSchema);

module.exports = Project;
