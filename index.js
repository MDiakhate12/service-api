const express = require('express')
const cors = require('cors')
const connect = require('./config/db');
const util = require('util')
// const { exec } = (require('child_process'));
exec = util.promisify(require('child_process').exec);
const VmInstance = require('./models/vmInstance');


const PORT = process.env.PORT || 8080;


const app = express()

connect();


app.use(cors())

app.use(express.json())

const checkAvailability = async (cpuRequest, memoryRequest, diskRequest) => {
    try {
        const { stdout: memoryTotal } = await exec("free --mega | awk '/Mem/ {print $7}'");
        const { stdout: memoryAvailable } = await exec("free --mega | awk '/Mem/ {print $4}'");
        const { stdout: cpu } = await exec("lscpu | awk '/^CPU\\(s\\):/  {print $2}'");
        const { stdout: diskAvailable } = await exec(`df -hm | awk '/^\\/dev\\// {split($0,a," "); sum += a[4]} END {print sum}'`);
        const { stdout: diskTotal } = await exec(`df -hm | awk '/^\\/dev\\// {split($0,a," "); sum += a[2]} END {print sum}'`);

        if (
            (memoryAvailable - memoryRequest) * 100 / memoryTotal >= 20 &&
            cpu - cpuRequest >= 0 &&
            (diskAvailable - diskRequest) * 100 / diskTotal >= 20
        ) {
            return { available: true, memoryAvailable: parseInt(memoryAvailable), diskAvailable: parseInt(diskAvailable), cpuAvailable: parseInt(cpu) }
        } else {
            return { available: false, memoryAvailable: parseInt(memoryAvailable), diskAvailable: parseInt(diskAvailable), cpuAvailable: parseInt(cpu) }
        }

    } catch (error) {
        console.error(error)
    }
}

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

    console.log(`REQUESTED RESOURCES: ${resources} \n`)


    // GET AVAILABLE RESOURCES
    const resources = await checkAvailability(numberOfVm * cpu, numberOfVm * memory, numberOfVm * disk)
    console.log(`AVAILABLE RESOURCES: ${resources} \n`)

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

app.listen(PORT, () => {
    console.log("Listenning on port ", PORT)
})
