import  express  from "express";
import dotenv from "dotenv";
import cors from "cors"

import AdminRoutes from "./Routes/AdminRoutes.js"
import ParentRoutes from "./Routes/ParentRoutes.js"
import DoctorRoutes from "./Routes/DoctorRoutes.js"
import connectDB from "./DB.js"

dotenv.config(); 

const app = express()

app.use(express.json()) 
app.use(express.urlencoded({ extended: true })) 
app.use(cors({ origin: '*' })); 


//routes configuration
app.use('/api/admin' , AdminRoutes)
app.use('/api/parent' , ParentRoutes)
app.use('/api/doctor' , DoctorRoutes)



const port = process.env.PORT || 3000; 

// Start the server
connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}).catch((error) => console.error(error)); 

