import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export function protectedRoute(req, res, next) {
    try {
        // get token from header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(" ")[1]; 

        if (!token) {
            return res.status(401).json({message: "Access token not found"});
        }

        // verify token
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decodedUser) => {
            if (err) {
                console.error(err);
                return res.status(403).json({message: "Invalid access token"});
            }
            // find user
            const user = await User.findById(decodedUser.userId).select('-hashedPassword') // get user except hashed password

            if (!user) {
                return res.status(404).json({message: "User not found"});
            }
            // return user in req
            req.user = user;
            next(); // finish middleware
        })
    }
    catch (error) {
        console.error("Error in verify JWT in authMiddleware", error);
        res.status(500),json({message: "Internal server error"});
    }
}