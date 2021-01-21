const util = require('util')

const exec = util.promisify(require('child_process').exec);

module.exports = async (cpuRequest, memoryRequest, diskRequest) => {
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
