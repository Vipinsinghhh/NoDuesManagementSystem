import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import StudentRouter from './routes/studentRoute.js';
import FacultyRouter from './routes/facultyRoute.js';
import HodRouter from './routes/hodRoute.js';
import ConnectDB from './config/dbConfig.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Uncomment this line if authentication is required
// import authMiddleware from './middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();

// Middleware Setup
app.use(express.json({ limit: "50mb" }));  // Allow large image uploads
app.use(express.urlencoded({ extended: true, limit: "50mb" }));  
app.use(bodyParser.json());
app.use(cors());

// Default Route
app.get('/', (req, res) => {
    res.send("Hello, World!");
});

// Routes
app.use("/Student", StudentRouter);
app.use("/Faculty", FacultyRouter);
app.use("/Hod", HodRouter);

// Database Connection
ConnectDB();

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
