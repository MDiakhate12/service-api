const express = require('express')
const cors = require('cors')
const connect = require('./config/db')
const VmInstance = require('./models/vmInstance')
const LoadBalancer = require('./models/loadBalancer')
const Project = require('./models/project')
// const checkAvailability = require('./utils');
const axios = require('axios')

const PORT = process.env.PORT || 8080
const BASE_DOMAIN_NAME = 'mouhammad.ml'
const PROVISIONING_URL = 'http://localhost:4000'
const PROVISIONING_URL_AWS = 'http://localhost:4000'
// const PROVISIONING_URL = `https://faas-cloud-provisioning.${BASE_DOMAIN_NAME}`
const ORIENTATION_URL = 'http://localhost:8085'
// const ORIENTATION_URL = `https://faas-cloud-orientation.${BASE_DOMAIN_NAME}`

const DEFAULT_TIMEOUT = 1000 * 60 * 10

// Suffix of ressources created on dev (vm instances)
const devInstances = ['frontend', 'backend', 'database']

// Suffix of ressources created on prod (loadBalancers)
const prodInstances = ['frontend', 'backend']

const app = express()

app.use(cors())

connect()

app.use(express.json())

app.get('/projects', async (req, res) => {
  try {
    let projects = await Project.find()
    console.log(projects)
    res.send(projects)
  } catch (error) {
    console.error(error)
  }
})

app.get('/projects/:projectId/instances', async (req, res) => {
  projectId = req.params.projectId
  try {
    let vmInstances = await VmInstance.find({ projectId })
    console.log(vmInstances)
    res.send(vmInstances)
  } catch (error) {
    console.error(error)
  }
})

app.get('/projects/:projectId/loadbalancers', async (req, res) => {
  projectId = req.params.projectId
  try {
    let loadBalancers = await LoadBalancer.find({ projectId })
    console.log(loadBalancers)
    res.send(loadBalancers)
  } catch (error) {
    console.error(error)
  }
})

app.get('/', async (req, res) => {
  try {
    let vmInstances = await VmInstance.find() //.populate('projectId')
    console.log(vmInstances)
    res.send(vmInstances)
  } catch (error) {
    console.error(error.message)
    return res.status(500).send('Server error')
  }
})

app.post('/provider-list', (req, res) => {
  // GET PROVIDER ORIENTATION
  axios
    .post(`${ORIENTATION_URL}/projects`, req.body)
    .then((response) => {
      console.log(response.data)
      return res.send(response.data)
    })
    .catch((error) => {
      console.error(error.message)
      return res.status(500).send('Server error')
    })
})

app.post('/register-vm', async (req, res) => {
  const { cpu, memory, disk, osType, osImage, ...project } = req.body

  // Example replace "DiafProject" to "diaf-project"
  let instanceGroupName = normalizeString(project.projectName)

  // TEST IF INSTANCE GROUP WITH SAME NAME EXIST
  testInstance = await VmInstance.find({ instanceGroupName })

  if (testInstance.length !== 0) {
    return res.send('Instance with same name already exist')
  }

  // GET REQUESTED RESOURCES
  console.log('REQUESTED RESOURCES: ', req.body)
  console.log('\n')

  // GET AVAILABLE RESOURCES
  // const resources = await checkAvailability(numberOfVm * cpu, numberOfVm * memory, numberOfVm * disk)
  // console.log("AVAILABLE RESOURCES: ", resources)

  // SAVE PROJECT ON DATABASE
  // if (resources.available) {
  try {
    // let os = await OsImage.findOne({ image: osImage, type: osType }).id

    let newProject = new Project(project)

    projectId = (await newProject.save())._id

    if (project.applicationType === 'web' && project.environment === 'dev') {
      devInstances.forEach(
        async (suffix) =>
          await VmInstance({
            name: `${instanceGroupName}-${suffix}`,
            instanceGroupName,
            cpu,
            memory,
            disk,
            osType,
            osImage,
            projectId,
          }).save(),
      )
    } else if (
      project.applicationType === 'web' &&
      project.environment === 'prod'
    ) {
      prodInstances.forEach(
        async (suffix) =>
          await LoadBalancer({
            name: `${instanceGroupName}-${suffix}`,
            projectId,
            instanceTemplate: {
              cpu,
              memory,
              disk,
              osType,
              osImage,
            },
          }).save(),
      )
    }

    return res.status(201).send({ _id: projectId, ...newProject })
  } catch (error) {
    console.error(error.message)
    return res.status(500).send('Server error')
  }
  // } else {
  //     return res.send("Insufficient ressources")
  // }
})

app.post('/create-vm', async (req, res) => {
  console.log('Creating VM:', req.body)

  req.setTimeout(DEFAULT_TIMEOUT)
  res.setTimeout(DEFAULT_TIMEOUT)

  // CREATE NEW VM
  provisioning(req.body)
    .then((instances) => res.send(instances))
    .catch((error) => res.send(error.message))
})

const provisioning = async (data) => {
  data['instanceGroupName'] = normalizeString(data.projectName)
  switch (data.provider) {
    case 'gcp':
      if (data.applicationType === 'web' && data.environment === 'dev') {
        return (
          axios
            .post(PROVISIONING_URL, data)
            // return axios.post(`${PROVISIONING_URL}/provisioning-google-${data.environment}`, data)
            .then(async (response) => {
              console.log('FROM CREATE VM:', newVmInstances)
              newVmInstances.forEach(async (instance, index) => {
                instance.name = response.data[index].name
                instance.publicIP = response.data[index].publicIP
                instance.privateIP = response.data[index].privateIP
                await instance.save()
              })

              let newVmInstances = await VmInstance.find({
                instanceGroupName: data.instanceGroupName,
              })
              console.log(newVmInstances)

              return newVmInstances
            })
            .catch((error) => {
              console.error(error.message)
              return error
            })
        )
      }
      if (data.applicationType === 'web' && data.environment === 'prod') {
        return (
          axios
            .post(PROVISIONING_URL, data)
            // return axios.post(`${PROVISIONING_URL}/provisioning-google-${data.environment}`, data)
            .then(async (response) => {
              let newLoadBalancers = await LoadBalancer.find({
                name: { $regex: `${data.instanceGroupName}-` },
              })

              console.log('DATA', data)
              console.log('RESPONSE DATA', response.data)

              newLoadBalancers.forEach(async (lb, index) => {
                lb.name = response.data[index].name
                lb.IPAddress = response.data[index].IPAddress
                lb.loadBalancingScheme =
                  response.data[index].loadBalancingScheme
                await lb.save()
              })

              console.log('NEW LOAD BALANCERS', newLoadBalancers)

              return newLoadBalancers
            })
            .catch((error) => {
              console.error(error.message)
              return error
            })
        )
      }
      break
    case 'aws':
      if (data.applicationType === 'web' && data.environment === 'dev') {
        return (
          axios
            .post(PROVISIONING_URL_AWS, data)
            // return axios.post(`${PROVISIONING_URL}/provisioning-google-${data.environment}`, data)
            .then(async (response) => {
              devInstances.forEach(async (suffix) => {
                const instance = await VmInstance.findOne({
                  name: `${data.instanceGroupName}-${suffix}`,
                })
                instance.publicIP = response.data[suffix].value
                await instance.save()
              })
              let newVmInstances = await VmInstance.find({
                instanceGroupName: data.instanceGroupName,
              })
              return newVmInstances
            })
            .catch((error) => {
              console.error(error.message)
              return error
            })
        )
      }
      if (data.applicationType === 'web' && data.environment === 'prod') {
        return (
          axios
            .post(PROVISIONING_URL, data)
            // return axios.post(`${PROVISIONING_URL}/provisioning-google-${data.environment}`, data)
            .then(async (response) => {
              Promise.all(
                prodInstances.map(async (suffix) => {
                  const lb = await LoadBalancer.findOne({
                    name: `${data.instanceGroupName}-${suffix}`,
                  })
                  console.log('load balancer: ', lb)
                  lb.IPAddress = response.data[suffix].value
                  await lb.save()
                }),
              ).then(async () => {
                console.log('DATA', data)
                console.log('RESPONSE DATA', response.data)

                let newLoadBalancers = await LoadBalancer.find({
                  name: { $regex: `${data.instanceGroupName}-` },
                })

                console.log('NEW LOAD BALANCERS', newLoadBalancers)

                return newLoadBalancers
              })
            })
            .catch((error) => {
              console.error(error.message)
              return error
            })
        )
      }
      break
    default:
      break
  }
}

// Example replace "DiafProject" to "diaf-project"
const normalizeString = (str) => {
  /**
   * Example replace "DiafProject" to "diaf-project"
   */
  return str
    .replace(/[A-Z][a-z]*/g, (str) => `-${str.toLowerCase()}`)
    .replace(/ /g, '')
    .trim()
    .replace(/--/g, '')
    .replace(/(^-)|(-$)/g, '')
}

// let server = http.createServer(app) // We can also do it like this

let server = app.listen(PORT, () => {
  console.log('Listenning on port ', PORT)
})

server.timeout = DEFAULT_TIMEOUT
