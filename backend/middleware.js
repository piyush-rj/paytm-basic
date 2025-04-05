const { JWT_SECRET } = require("./config")
const jwt = require("jsonwebtoken")

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(403).json({
            msg: "authentication failed"
        })
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if(decoded.userId){
            req.userId = decoded.userId;
        } else {
            return res.status(403).json({})
        }

        next();
    } catch (error) {
        return res.status(403).json({
            msg: "Authentication failed"
        })
    }
}

module.exports = {
    authMiddleware
}