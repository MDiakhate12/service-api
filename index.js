const express = require('express')
const cors = require('cors')
const connect = require('./config/db');
const VmInstance = require('./models/vmInstance');
const Project = require('./models/project');
const checkAvailability = require('./utils');
const axios = require('axios')

const PORT = process.env.PORT || 8080;

const app = express()

app.use(cors())

connect();

app.use(express.json())

app.get("/projects", async (req, res) => {
    try {
        let projects = await Project.find()
        console.log(projects)
        res.send(projects);
    } catch (error) {
        console.error(error)
    }
})

app.get("/projects/:projectId/instances", async (req, res) => {
    projectId = req.params.projectId
    try {
        let vmInstances = await VmInstance.find({ projectId })
        console.log(vmInstances)
        res.send(vmInstances);
    } catch (error) {
        console.error(error)
    }
})

app.get("/", async (req, res) => {
    try {
        let vmInstances = await VmInstance.find() //.populate('projectId')
        console.log(vmInstances)
        res.send(vmInstances);
    } catch (error) {
        console.error(error.message)
        return res.status(500).send("Server error")
    }

})

app.post("/provider-list", (req, res) => {
    // GET PROVIDER ORIENTATION
    axios.post('https://faas-cloud-orientation.mouhammad.ml/projects', req.body)
        .then((response) => {
            console.log(response.data)
            return res.send(response.data)
        }).catch((error) => {
            console.error(error.message)
            return res.status(500).send("Server error")
        })
})

app.post("/create-vm", (req, res) => {
    // CREATE NEW VM
    axios.post('https://faas-cloud-backend.mouhammad.ml/', req.body)
        .then((response) => {
            return res.send(response.data)
        })
        .catch((error) => {
            console.error(error.message)
            return res.status(500).send("Server error")
        })
})

app.post("/register-vm", async (req, res) => {

    const {
        projectName,
        projectArchitecture,
        applicationType,
        environment,
        SLA,
        dataSize,
        dependencies,
        connectedApplications,
        costEstimation,
        provider,
        vmGroupName,
        numberOfVm,
        cpu,
        memory,
        disk,
        osType,
        osImage,
    } = req.body

    // GET REQUESTED RESOURCES
    console.log("REQUESTED RESOURCES: ", req.body)
    console.log("\n")

    // GET AVAILABLE RESOURCES
    // const resources = await checkAvailability(numberOfVm * cpu, numberOfVm * memory, numberOfVm * disk)
    // console.log("AVAILABLE RESOURCES: ", resources)

    // SAVE PROJECT ON DATABASE
    // if (resources.available) {
    try {
        // let os = await OsImage.findOne({ image: osImage, type: osType }).id

        let newProject = new Project({
            projectName,
            projectArchitecture,
            applicationType,
            environment,
            SLA,
            dataSize,
            dependencies,
            connectedApplications,
            costEstimation,
            provider,
        })

        projectId = (await newProject.save())._id

        let newInstance = new VmInstance({
            vmGroupName,
            numberOfVm,
            cpu,
            memory,
            disk,
            osType,
            osImage,
        })

        newInstance = await newInstance.save()
        return res.status(201).send(newInstance)
    } catch (error) {
        console.error(error.message)
        return res.status(500).send("Server error")
    }
    // } else {
    //     return res.send("Insufficient ressources")
    // }
})

app.listen(PORT, () => {
    console.log("Listenning on port ", PORT)
})
