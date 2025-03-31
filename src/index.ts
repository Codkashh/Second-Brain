import express from "express";
import mongoose from "mongoose";
import Jwt  from "jsonwebtoken";
import { UserModel } from "./db";
import { JWT_PASSWORD } from "./config";
const app = express();
app.use(express.json());

app.post("/api/v1/signup", async (req, res) => {
    //Todo- zod validation and hash password
    const username = req.body.username;
    const password = req.body.password;

    try{
        await UserModel.create({
            username: username,
            password: password
        })
    
        res.json({
            message: "User signed up"
        })
    } catch (error) {
        res.status(411).json({
            message: "User already exists"
        })
    }
})

app.post("/api/v1/signin", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const existingUser = await UserModel.findOne({
        username,
        password
    })

    if(existingUser) {
        const token = Jwt.sign({
            id: existingUser._id
        }, JWT_PASSWORD)

        res.json({
            token
        })
    } else{
        res.status(403).json({
            message: "Invalid username or password"
        })
    }
})

app.post("/api/v1/content", (req, res) => {
    
})

app.get("/api/v1/content", (req, res) => {
    
})

app.delete("/api/v1/content", (req, res) => {
    
})

app.post("/api/v1/brain/share", (req, res) => {
    
})

app.get("/api/v1/brain/:shareLink", (req, res) => {
    
}) 

app.listen(3000);