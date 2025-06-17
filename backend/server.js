const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const db = require("./config/db");
const cloudinary = require("cloudinary").v2;
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');
const errorHandler = require("./middlewares/errorHandler");
const helmet = require("helmet");

//Models

require("./models/User");
require("./models/Movie");
require("./models/Review");



const authRoutes = require("./routes/authRoute");
const movieRoutes = require("./routes/movieRoute");


dotenv.config();
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const app = express();
app.use(helmet());

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/movies', movieRoutes);


// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

db();
// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});