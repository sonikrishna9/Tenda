const mongoose = require("mongoose")

const Dbconnect = async () => {
    try {
          "mongodb+srv://atech:ekha%40123@cluster0.s4r4kdm.mongodb.net/mydb"

        await mongoose.connect(process.env.CONNECTION_STRING)
        console.log("Database Connection Sucessfully")
    }
    catch (error) {
        console.log("DB Connection Error", error)
        process.exit(1)
    }
}

module.exports = Dbconnect