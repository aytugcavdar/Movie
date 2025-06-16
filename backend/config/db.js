const mongoose = require("mongoose");
require('dotenv').config();




const mongoURI = process.env.MONGODB_URI;

const db = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log("MongoDB connected");

    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
};

module.exports = db;
