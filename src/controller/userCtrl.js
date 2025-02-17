const User = require("../model/userModel");
const path = require("path")
const bcrypt = require("bcrypt")
const fs = require("fs");
const { v4 } = require("uuid");

const UserCtrl = {
    getAll: async (req, res) => {
        try {
            let users = await User.find();

            users = users.map(user => {
                delete user._doc.password
                return user._doc
            })

            res.status(200).send({ message: "All users", users })
        } catch (error) {
            console.log(error);
            res.status(501).send({ message: error.message })
        }
    },

    getOne: async (req, res) => {
        try {
            const id = req.params.id

            const user = await User.findById(id);
            if (!user) {
                return res.status(404).send({ message: "User not found" })
            }

            delete user._doc.password
            res.status(200).send({ message: "User is found", user })
        } catch (error) {
            console.log(error);
            res.status(501).send({ message: error.message })
        }
    },

    deleteUser: async (req, res) => {
        try {
            const id = req.params.id;
            if (id !== req.user._id && !req.userIsAdmin) {
                return res.status(403).send({ message: "You are not allowwed to delete users" });
            }

            const user = await User.findByIdAndDelete(id)
            if (!user) {
                return res.status(404).send({ message: "User Not found" });
            }

            if (user.profilePicture !== "") {
                fs.unlink(path.join(__dirname, '../', "public", user.profilePicture), err => {
                    if (err) throw err
                })
            }

            if (user.coverPicture !== "") {
                fs.unlink(path.join(__dirname, '../', "public", user.coverPicture), err => {
                    if (err) throw err
                })
            }

            res.status(200).send({ message: "User deleted sucssesfully", user });
        } catch (error) {
            console.log(error);
            res.status(503).send({ message: error.message });
        }
    },

    updateUser: async (req, res) => {
        try {
            const id = req.params.id;
            if (id !== req.user._id && !req.userIsAdmin) {
                return res.status(403).send({ message: "You are not allowwed to update users" });
            }

            const user = await User.findById(id)
            if (!user) {
                return res.status(404).send({ message: "User Not found" });
            }

            if (req.body.password?.length > 0) {
                const hashedPassword = await bcrypt.hash(req.body.password, 10)
                req.body.password = hashedPassword
            } else {
                delete req.body.password
            }

            if (req.files) {
                if (req.files.profilePicture) {
                    const { profilePicture } = req.files
                    const format = path.extname(profilePicture.name)

                    if (format !== ".png" && format !== ".jpeg" && format !== ".jpg") {
                        return res.status(401).send({ message: "File format is incorrect" })
                    }
                    const nameImg = v4() + format;
                    profilePicture.mv(path.join(__dirname, '../', "public", nameImg), err => {
                        if (err) throw err
                    })

                    req.body.profilePicture = nameImg
                    if (user.profilePicture !== "") {
                        fs.unlink(path.join(__dirname, '../', "public", user.profilePicture), err => {
                            if (err) throw err
                        })
                    }
                }

                if (req.files.coverPicture) {
                    const { coverPicture } = req.files
                    const format = path.extname(coverPicture.name)

                    if (format !== ".png" && format !== ".jpeg" && format !== ".jpg") {
                        return res.status(401).send({ message: "File format is incorrect" })
                    }
                    const nameImg = v4() + format;
                    coverPicture.mv(path.join(__dirname, '../', "public", nameImg), err => {
                        if (err) throw err
                    })

                    req.body.coverPicture = nameImg
                    if (user.coverPicture !== "") {
                        fs.unlink(path.join(__dirname, '../', "public", user.coverPicture), err => {
                            if (err) throw err
                        })
                    }
                }
            }

            const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true })
            res.status(200).send({ message: "User updated sucssesfully", user: updatedUser });
        } catch (error) {
            console.log(error);
            res.status(503).send({ message: error.message });
        }
    }
}

module.exports = UserCtrl