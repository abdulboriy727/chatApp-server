const JWT = require("jsonwebtoken");
const User = require("../model/userModel")
const bcrypt = require("bcrypt");

const authCtrl = {
    signup: async (req, res) => {
        try {
            const { firstname, lastname, email, password } = req.body
            if (!firstname || !lastname || !email || !password) {
                return res.status(400).send({ message: "Please fiil all fields" });
            }

            const oldUser = await User.findOne({ email })
            if (oldUser) {
                return res.status(400).send({ message: "This email already exists" })
            }

            if (req.body.role) {
                req.body.role = Number(req.body.role)
            }

            const hashedPassword = await bcrypt.hash(password, 10)
            req.body.password = hashedPassword

            const user = await User.create(req.body)
            delete user._doc.password

            const token = JWT.sign(user._doc, process.env.JWT_SECRET_KEY)
            res.status(201).send({ message: "Signup sucsessfully", user: user._doc, token })
        } catch (error) {
            console.log(error);
            res.status(503).send({ message: error.message });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).send({ message: "Please fiil all fields" });
            }

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).send({ message: "Email or password is incorrect" });
            }

            const comparePassword = await bcrypt.compare(password, user.password);
            if (!comparePassword) {
                return res.status(400).send({ message: "Email or password is incorrect" });
            }
            delete user._doc.password;

            const token = JWT.sign(user._doc, process.env.JWT_SECRET_KEY);
            res.status(200).send({ message: "Login successfully", user: user._doc, token });
        } catch (error) {
            console.log(error);
            res.status(503).send({ message: error.message });
        }
    }
}
module.exports = authCtrl