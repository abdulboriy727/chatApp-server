const { v4 } = require("uuid")
const path = require("path")
const Message = require("../model/messageModel")
const fs = require("fs")

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
            const { chatId, senderId, text } = req.body
            if (!chatId || !senderId || !text) {
                return res.status(403).send({ message: "Please fill all fields" })
            }

            if (req.files) {
                if (req.files.file) {
                    const { file } = req.files
                    const format = path.extname(file.name)

                    if (format !== ".png" && format !== ".jpeg" && format !== ".jpg") {
                        return res.status(401).send({ message: "File format is incorrect" })
                    }
                    const nameFile = v4() + format;
                    file.mv(path.join(__dirname, '../', "public", nameFile), err => {
                        if (err) throw err
                    })
                    req.body.file = nameFile
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
                fs.unlink(path.join(__dirname, '../', "public", message.file), err => {
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
                return res.status(404).send({ message: "Message Not found" });
            }

            if (message.senderId !== req.user._id && !req.userIsAdmin) {
                return res.status(403).send({ message: "Not allowed" });
            }

            if (req.files) {
                const { file } = req.files
                const format = path.extname(file.name)

                if (format !== ".png" && format !== ".jpeg" && format !== ".jpg") {
                    return res.status(401).send({ message: "File format is incorrect" })
                }
                const nameFile = v4() + format;
                file.mv(path.join(__dirname, '../', "public", nameFile), err => {
                    if (err) throw err
                })

                req.body.file = nameFile
                if (message.file !== "") {
                    fs.unlink(path.join(__dirname, '../', "public", message.file), err => {
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