import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { connectDB } from '../config/db.js';
import authRouter from '../routes/authRoute.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(cookieParser());


//public routes
app.use('/api/v1/auth', authRouter);

//private routes

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server started on port:", PORT)
    })
})