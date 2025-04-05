const express = require("express")
const z = require("zod")
const { User } = require("../db")
const { Account } = require("../db")
const jwt = require("jsonwebtoken")
const { JWT_SECRET } = require("../config")
const router = express.Router()
const { authMiddleware } = require("../middleware")

const signupBody = z.object({
    username: z.string().email(),
    password: z.string(),
    firstName: z.string(),
    lastName: z.string()
})

router.post("/signup", async (req, res) => {
    const { success } = signupBody.safeParse(req.body)
    if(!success) {
        return res.status(411).json({
            msg: "invalid inputs"
        })
    } 

    const existingUser = await User.findOne({
        username: req.body.username
    })

    if(existingUser) {
        return res.status(411).json({
            msg: "user already exists"
        })
    }

    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    })

    const userId = user._id;

    await Account.create({
        userId,
        balance: 1 + Math.random() * 10000,
    })

    const token = jwt.sign({userId}, JWT_SECRET)

    res.json({
        msg: "user created successfully",
        token: token
    })
})


const signinBody = z.object({
    username: z.string().email(),
    password: z.string()
})

router.post("/signin", async (req, res) => {
    const { success } = signinBody.safeParse(req.body);

    if(!success){
        return res.status(411).json({
            msg: "invalid inputs"
        })
    }
    const user = await User.findOne({
        username: req.body.username
    })

    if (user) {
        const token = jwt.sign({userId: user._id}, JWT_SECRET);
        res.json({
            msg: "user logged in!",
            token: token
        })
        return;
    }

    res.status(411).json({
        msg: "error while signing in"
    })

    
})

const updateBody = z.object({
	password: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
})

router.put("/update", authMiddleware, async (req, res) => {
    const { success } = updateBody.safeParse(req.body)
    if (!success) {
        res.status(411).json({
            message: "Error while updating information"
        })
    }

		await User.updateOne({ _id: req.userId }, req.body);
	
    res.json({
        message: "Updated successfully"
    })
})

router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("firstName lastName username");

        if (!user) {
            return res.status(403).json({
                msg: "User does not exist"
            });
        }

        res.json({
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username
        });
    } catch (error) {
        res.status(403).json({
            msg: "Server error"
        });
    }
});



router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})

 

module.exports = router;