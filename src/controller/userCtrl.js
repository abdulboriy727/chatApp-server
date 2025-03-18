const User = require("../model/userModel");
const bcrypt = require("bcrypt")
const cloudinary = require("cloudinary")
const fs = require("fs")

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

const removeTempFile = (path) => {
    fs.unlink(path, err => {
        if (err) throw err
    })
}

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
                const public_id = user.profilePicture.public_id
                await cloudinary.v2.uploader.destroy(public_id, async (err) => {
                    if (err) throw err
                })
            }

            if (user.coverPicture !== "") {
                const public_id = user.coverPicture.public_id
                await cloudinary.v2.uploader.destroy(public_id, async (err) => {
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
                    const result = await cloudinary.v2.uploader.upload(profilePicture.tempFilePath,
                        { folder: "ChatApp" }, async (err, data) => {
                            if (err) {
                                throw err
                            } else {
                                removeTempFile(profilePicture.tempFilePath)
                                return data
                            }
                        })
                    const imageResult = { url: result.secure_url, public_id: result.public_id }
                    req.body.profilePicture = imageResult

                    if (user.profilePicture !== "") {
                        const public_id = user.profilePicture.public_id
                        await cloudinary.v2.uploader.destroy(public_id, async (err) => {
                            if (err) throw err
                        })
                    }
                }

                if (req.files.coverPicture) {
                    const { coverPicture } = req.files
                    const result = await cloudinary.v2.uploader.upload(coverPicture.tempFilePath,
                        { folder: "ChatApp" }, async (err, data) => {
                            if (err) {
                                throw err
                            } else {
                                removeTempFile(coverPicture.tempFilePath)
                                return data
                            }
                        })
                    const imageResult = { url: result.secure_url, public_id: result.public_id }
                    req.body.coverPicture = imageResult

                    if (user.coverPicture !== "") {
                        const public_id = user.coverPicture.public_id
                        await cloudinary.v2.uploader.destroy(public_id, async (err) => {
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