const Chat = require("../model/chatModel")
const Message = require("../model/messageModel")

const chatCtrl = {

    findChat: async (req, res) => {
        try {
            const { firstId, secondId } = req.params
            const chat = await Chat.findOne({ members: { $all: [firstId, secondId] } })
            if (chat) {
                return res.status(200).send({ message: "Found chat", chat })
            }

            const newChat = await Chat.create({ members: [firstId, secondId] })
            res.status(201).send({ message: "Found chat", chat: newChat })
        } catch (error) {
            console.log(error);
            res.status(503).send({ message: error.message });
        }
    },

    userChats: async (req, res) => {
        try {
            const userId = req.user._id
            const chats = await Chat.find({ members: { $in: [userId] } })

            res.status(200).send({ message: "User's chats", chat: chats })
        } catch (error) {
            console.log(error);
            res.status(503).send({ message: error.message });
        }
    },

    deleteChat: async (req, res) => {
        try {
            const chatId = req.params.chatId    
            const chat = await Chat.findByIdAndDelete(chatId)
            if (!chat) {
                return res.status(404).send({ message: "Chat not found" })
            }

            await Message.deleteMany({chatId: chatId})
            res.status(200).send({ message: "Chat deleted", chat })
        } catch (error) {
            console.log(error);
            res.status(503).send({ message: error.message });
        }
    },
}
module.exports = chatCtrl