import User from "../models/User.js";
import Session from "../models/Session.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import clearCookie from 'cookie-parser'

const ACCESS_TOKEN_TTL = '30m'; // normally <= 15m
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 days

export async function signUp(req, res) {
    try {
        const {username, password, email, firstName, lastName} = req.body;

        if (!username || !password || !email || !firstName || !lastName) {
            return res.stauts(400).json({message: "Please provide username, password, email, firstName, lastName"});

        }

        // Check if username exists
        const duplicate = await User.findOne({username});

        if (duplicate) {
            return res.status(409).json({message: "Username already exist"});
        }

        // encrypt password
        const hashedPassword = await bcrypt.hash(password, 10); // salt = 10


        // create new user
        await User.create({
            username, 
            hashedPassword,
            email,
            displayName: `${firstName} ${lastName}`
        })

        // return
        return res.sendStatus(204);
    }
    catch (error) { 
        console.error("Error in signUp", error);
        res.status(500).json({message: "Internal server error"});
    }
}

export async function signIn(req, res) {
    try {
        // get input 
        const {username, password} = req.body;

        if (!username || !password) {
            return res.status(400).json({message: "Please enter your username and password"});
        }

        // get hashedPassword in DB to compare with password input
        const user = await User.findOne({username});

        if (!username) {
            return res.status(401).json({message: "username or password incorrect"});
        }

        // check password
        const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);

        if (!passwordCorrect) {
            return res.status(401).json({message: "username or password incorrect"})
        }

        // if true, create access token with JWT
        const accessToken = jwt.sign(
            {userId: user._id}, 
            process.env.ACCESS_TOKEN_SECRET, 
            {expiresIn: ACCESS_TOKEN_TTL}
        )


        // create refresh token
        const refreshToken = crypto.randomBytes(64).toString('hex');


        // create new session to save refresh token 
        await Session.create({
            userId: user._id,
            refreshToken,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL)
        })
        // return refresh token in cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none", //backend !== frontend
            maxAge: REFRESH_TOKEN_TTL
        });

        // return access token in res
        return res.status(200).json({message: `User ${user.displayName} logged in`, accessToken});
    }
    catch (error) {
        console.error("Error in signIn", error);
        res.status(500).json({message: "Internal server error"});
    }
}

export async function signOut(req, res) {
    try {
        // get refresh token from cookie
        const token = req.cookies?.refreshToken;

        if (token) {
            // delete refresh token in Session
            await Session.deleteOne({refreshToken: token});

            // delete cookie
            res.clearCookie("refreshToken");
        }
        return res.sendStatus(204);
    }
    catch (error) {
        console.error("Error in signOut", error);
        res.status(500).json({message: "Internal server error"});
    }
}