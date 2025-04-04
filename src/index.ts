import express from "express";
import { random } from "./utils";
import Jwt  from "jsonwebtoken";
import { ContentModel, UserModel, LinkModel } from "./db";
import { JWT_PASSWORD } from "./config";
import { userMiddleware } from "./middleware";
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

app.post("/api/v1/content", userMiddleware, async(req, res) => {
    const link = req.body.link;
    const type = req.body.type;
    await ContentModel.create({
        link,
        type,
        //@ts-ignore
        userId: req.userId,
        tags:[]
    })
    res.json({
        message: "Content added"
    })
})

app.get("/api/v1/content", userMiddleware, async(req, res) => {
    //@ts-ignore
    const userId = req.userId;
    const content = await ContentModel.find({
        userId: userId
    }).populate("userId", "username");
    res.json({
        content
    }) 
})

app.delete("/api/v1/content", userMiddleware, async(req, res) => {
    const contentId = req.body.contentId;
    
    await ContentModel.deleteMany({
        contentId,
        //@ts-ignore
        userId: req.userId
    })
    res.json({
        message: "Content deleted"
    })
})
// Route 6: Share Content Link
app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
    const { share } = req.body;
    if(share) {
        // Check if a link already exists for the user.
        const existingLink = await LinkModel.findOne({ userId: req.userId });
        if(existingLink) {
            res.json({
                hash: existingLink.hash // Send existing hash if found.
            })
        }

        // Generate a new hash for the shareable link.
        const hash = random(10);
        await LinkModel.create({
            userId: req.userId,
            hash
        });
        res.json({hash});// Send new hash in the response.
    } else {
        // Remove the shareable link if share is false.
        await LinkModel.deleteOne({userId: req.userId});
        res.json({message: "Removed Link"}) // Send success response.
    }
});

app.get("/api/v1/brain/:shareLink",async (req, res) => {
    const hash = req.params.shareLink;

    // Find the link using the provided hash.
    const link = await LinkModel.findOne({ hash });
    if (!link) {
        res.status(404).json({ message: "Invalid share link" }); // Send error if not found.
        return;
    }

    // Fetch content and user details for the shareable link.
    const content = await ContentModel.find({ userId: link.userId });
    const user = await UserModel.findOne({ _id: link.userId });

    if (!user) {
        res.status(404).json({ message: "User not found" }); // Handle missing user case.
        return;
    }

    res.json({
        username: user.username,
        content
    }); // Send user and content details in response.
}) 

app.listen(3000);