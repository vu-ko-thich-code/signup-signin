import express from 'express'
import { authMe } from '../controllers/userController.js';

const userRoute = express.Router();

userRoute.get("/me", authMe);

export default userRoute;
