const mongoose = require("mongoose")

const Dbconnect = async () => {
    try {

        await mongoose.connect(process.env.CONNECTION_STRING)
        console.log("Database Connection Sucessfully")
    }
    catch (error) {
        console.log("DB Connection Error", error)
        process.exit(1)
    }
}

module.exports = Dbconnect