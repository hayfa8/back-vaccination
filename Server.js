import  express  from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors"

import AdminRoutes from "./Routes/AdminRoutes.js"
import ParentRoutes from "./Routes/ParentRoutes.js"
import DoctorRoutes from "./Routes/DoctorRoutes.js"
import NotificationRoutes from './Routes/NotificationRoutes.js'; 

import { startCronJob } from "./Middleware/scheduler.js"

dotenv.config(); 

const app = express()

app.use(express.json()) 
app.use(express.urlencoded({ extended: true })) 
app.use(cors({ origin: '*' })); 


//routes config
app.use('/api/admin' , AdminRoutes)
app.use('/api/parent' , ParentRoutes)
app.use('/api/doctor' , DoctorRoutes)
app.use('/api/notifications', NotificationRoutes); 


const port = process.env.PORT || 3000; 
// Connect to MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useUnifiedTopology: true,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // Exit process on error
    }
};




// Start the server
connectDB().then(() => {
    startCronJob();
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}).catch((error) => console.error(error)); 

