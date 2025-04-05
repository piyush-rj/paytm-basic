const express = require("express")
const mongoose = require("mongoose")
const router = express.Router();
const { Account } = require("../db")
const { authMiddleware } = require("../middleware")

router.get("/balance", authMiddleware, async(req, res) => {
    const account = await Account.findOne({
        userId: req.userId
    })

    if(!account){
        return res.status(404).json({
            msg: "account not found"
        })
    }
    res.json({
        balance: account.balance
    })
})


router.post("/transfer", authMiddleware, async (req, res) => {
    const session = await mongoose.startSession();

    session.startTransaction();
    const { amount, to } = req.body;

    const account = await Account.findOne({
        userId: req.userId
    }).session(session)

    // no acc balance -> abort
    if (!account || account.balance < amount){
        await session.abortTransaction();
        return res.status(411).json({
            message: "insufficient balance"
        })
    }

    const toAccount = await Account.findOne({ userId: to }).session(session);

    // no receiver account -> abort
    if (!toAccount){
        await session.abortTransaction();
        return res.status(411).json({
            message: "invalid account"
        })
    }

    await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount }}).session(session)

    await Account.updateOne({ userId: to }, { $inc : {balance : amount}}).session(session)

    await session.commitTransaction();
    res.json({
        msg: "transfer complete"
    })
})

module.exports = router;