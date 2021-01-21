const express = require('express')
const cors = require('cors')
const connect = require('./config/db');
const VmInstance = require('./models/vmInstance');
const checkAvailability = require('./utils');

const PORT = process.env.PORT || 8080;

const app = express()

app.use(cors())

connect();

app.use(express.json())

app.get("/", async (req, res) => {
    try {
        let vmInstances = await VmInstance.find()
        console.log(vmInstances)
        res.send(vmInstances);
    } catch (error) {
        console.error(error)
    }

})

app.post("/", async (req, res) => {
    const { name, cpu, memory, disk, osImage, osType, numberOfVm } = req.body

    console.log("REQUESTED RESOURCES: ", req.body)
    
    console.log("\n")


    // GET AVAILABLE RESOURCES
    const resources = await checkAvailability(numberOfVm * cpu, numberOfVm * memory, numberOfVm * disk)
    console.log("AVAILABLE RESOURCES: ", resources)

    // RETURN TRUE OR FALSE
    if (resources.available) {
        try {
            // let os = await OsImage.findOne({ image: osImage, type: osType }).id
            let newInstance = new VmInstance({
                name,
                cpu,
                memory,
                disk,
                osType,
                osImage
            })
            newInstance = await newInstance.save()
            return res.status(201).send(newInstance)
        } catch (error) {
            console.error(error.message)
            return res.status(500).send("Server error")
        }
    } else {
        return res.send("Insufficient ressources")
    }
})

const http = require('http');
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

const httpsServer = https.createServer(options, app);

app.listen(PORT, "0.0.0.0", () => {
    console.log("Listenning on port ", PORT)
})

httpsServer.listen(8443);
