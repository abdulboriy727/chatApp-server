const router = require("express").Router()
const chatCtrl = require("../controller/chatCtrl")
const userMiddleware = require("../middleware/userMiddleware")

router.get("/chat/:firstId/:secondId", userMiddleware, chatCtrl.findChat)
router.get("/chat", userMiddleware, chatCtrl.userChats)
router.delete("/chat/:chatId", userMiddleware, chatCtrl.deleteChat)

module.exports = router