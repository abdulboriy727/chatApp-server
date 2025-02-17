const JWT = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const userMiddleware = (req, res, next) => {
    const token = req.headers.token
    if (!token) {
        return res.status(401).send({ message: "Token is required" });
    }
    try {
        const decodeUser = JWT.verify(token, JWT_SECRET_KEY)
        req.user = decodeUser
        if (decodeUser.role === 101) {
            req.userIsAdmin = true
        }
        next()
    } catch (error) {
        res.status(503).send({ message: error.message });
    }
}

module.exports = userMiddleware