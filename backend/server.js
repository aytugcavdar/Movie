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
const { Server } = require("socket.io");
const http = require("http");

//Models

require("./models/User");
require("./models/Movie");
require("./models/Review");
require("./models/List");
require("./models/Cast");
require("./models/Crew");
require("./models/Watchlist");
require("./models/Person");
require("./models/Notification");



const authRoutes = require("./routes/authRoute");
const movieRoutes = require("./routes/movieRoute");
const personRoutes = require("./routes/personRoute");
const reviewRoutes = require("./routes/reviewRoute");
const watchlistRoutes = require("./routes/watchlistRoute");
const userRoutes = require("./routes/userRoute");
const listRoutes = require("./routes/listRoute");
const adminRoutes = require("./routes/adminRoute");
const notificationRoutes = require("./routes/notificationRoute");
const statisticsRoutes = require("./routes/statisticsRoute");





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
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
app.use(express.json());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/movies', movieRoutes);
app.use('/api/v1/persons', personRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/watchlists', watchlistRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/lists', listRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/statistics', statisticsRoutes);


const server = http.createServer(app); 


const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL, 
        credentials: true
    }
});



app.set('socketio', io);

io.on('connection', (socket) => {
    console.log('Bir kullanıcı bağlandı:', socket.id);


    socket.on('joinRoom', (userId) => {
        socket.join(userId);
        console.log(`Kullanıcı ${userId} kendi odasına katıldı.`);
    });

    socket.on('disconnect', () => {
        console.log('Bir kullanıcı ayrıldı:', socket.id);
    });
});


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