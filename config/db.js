const mongoose = require('mongoose')
const config = require('config')

const DB_URI = config.get("DB_URI")

const connect = async () => {
    try {
        await mongoose.connect(DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        });

        console.log("MongoDB connected...")
    } catch (error) {
        console.error(error.message)

        process.exit(1);
    }

}


module.exports = connect;

