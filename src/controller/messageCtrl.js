const Message = require("../model/messageModel")
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

const messageCtrl = {

    getMessage: async (req, res) => {
        try {
            const { chatId } = req.params
            const message = await Message.find({ chatId })
            if (!message) {
                return res.status(404).send({ message: "Chat not found" })
            }

            res.status(200).send({ message: "Chat's messages", messages: message })
        } catch (error) {
            console.log(error);
            res.status(503).send({ message: error.message });
        }
    },

    addMessage: async (req, res) => {
        try {
            const { chatId, senderId } = req.body
            if (!chatId || !senderId) {
                return res.status(403).send({ message: "Please fill all fields" })
            }

            if (req.files) {
                if (req.files.file) {
                    const { file } = req.files
                    const result = await cloudinary.v2.uploader.upload(file.tempFilePath,
                        { folder: "ChatApp" }, async (err, data) => {
                            if (err) {
                                throw err
                            } else {
                                removeTempFile(file.tempFilePath)
                                return data
                            }
                        })
                    const imageResult = { url: result.secure_url, public_id: result.public_id }
                    req.body.file = imageResult
                }
            }

            const message = await Message.create(req.body)
            res.status(201).send({ message: "New message", message })
        } catch (error) {
            console.log(error);
            res.status(503).send({ message: error.message });
        }
    },

    deleteMessage: async (req, res) => {
        try {
            const id = req.params.id;
            const message = await Message.findById(id)
            if (!message) {
                return res.status(404).send({ message: "Message Not found" });
            }

            if (message.senderId !== req.user._id && !req.userIsAdmin) {
                return res.status(403).send({ message: "Not allowed" });
            }

            const deletedMessage = await Message.findByIdAndDelete(id)
            if (message.file !== "") {
                const public_id = message.file.public_id
                await cloudinary.v2.uploader.destroy(public_id, async (err) => {
                    if (err) throw err
                })
            }

            res.status(200).send({ message: "Message deleted sucssesfully", deletedMessage });
        } catch (error) {
            console.log(error);
            res.status(503).send({ message: error.message });
        }
    },

    updateMessage: async (req, res) => {
        try {
            const id = req.params.id
            const message = await Message.findById(id)
            if (!message) {
                return res.status(404).send({ message: "Message not found" });
            }

            if (message.senderId !== req.user._id && !req.userIsAdmin) {
                return res.status(403).send({ message: "Not allowed" });
            }

            if (req.files) {
                const { file } = req.files
                const result = await cloudinary.v2.uploader.upload(file.tempFilePath,
                    { folder: "ChatApp" }, async (err, data) => {
                        if (err) {
                            throw err
                        } else {
                            removeTempFile(file.tempFilePath)
                            return data
                        }
                    })
                const imageResult = { url: result.secure_url, public_id: result.public_id }
                req.body.file = imageResult

                if (message.file !== "") {
                    const public_id = message.file.public_id
                    await cloudinary.v2.uploader.destroy(public_id, async (err) => {
                        if (err) throw err
                    })
                }
            }

            const updatedMessage = await Message.findByIdAndUpdate(id, req.body, { new: true })
            res.status(200).send({ message: "Message updated sucssesfully", updatedMessage });
        } catch (error) {
            console.log(error);
            res.status(503).send({ message: error.message });
        }
    },
}
module.exports = messageCtrl