const DB_USER = process.env.DB_USER || 'Amet'
const DB_PASSWORD = process.env.DB_PASSWORD || 'amet'
const DB_NAME = process.env.DB_NAME || 'vmDatabase'

// const DB_URI = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@clusterprovisionning.3p11m.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`

const DB_URI = 'mongodb://localhost:27017/testeur'
module.exports = DB_URI
