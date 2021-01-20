const express = require('express')
const cors = require('cors')
const connect = require('./config/db');
const util = require('util')
// const { exec } = (require('child_process'));
exec = util.promisify(require('child_process').exec);

const PORT = process.env.PORT || 4000;


const app = express()

connect();

app.use(cors())

app.use(express.json())

const getAvailableRessources = async () => {
    { stdout: memory } await exec("free --mega | awk '/Mem/ {print $4/$7*100}'");
    { stdout: cpu } await exec("lscpu | awk '/^CPU\(s\):/  {print $2}'");
    { stdout: diskAvailable } await exec(`df -hm | awk '/^\/dev\// {split($0,a," "); sum += a[4]} END {print sum}'`);
    { stdout: diskTotal } await exec(`df -hm | awk '/^\/dev\// {split($0,a," "); sum += a[2]} END {print sum}'`);
    let disk = diskAvailable / diskTotal * 100
    let available = false;
    
    if (memory >= 80 && cpu > 2 && disk > 50) {
        available = true
    } 

    return { available, cpu, memory, disk }
}

app.get("/get-available-ressources", async (req, res) => {
    const { numberOfVms, cpu, memory, disk, osImage } = req.body

    // GET AVAILABLE RESSOURCES
    const ressources = await getAvailableRessources()

    // RETURN TRUE OR FALSE
    res.send(ressources)
})

app.listen(PORT, () => {
    console.log("Listenning on port ", PORT)
})

