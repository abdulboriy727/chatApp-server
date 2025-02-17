const router = require("express").Router()
const messageCtrl = require("../controller/messageCtrl")
const userMiddleware = require("../middleware/userMiddleware")

router.get("/message/:chatId", userMiddleware, messageCtrl.getMessage)
router.post("/message", userMiddleware, messageCtrl.addMessage)
router.delete("/message/:id", userMiddleware, messageCtrl.deleteMessage)
router.put("/message/:id", userMiddleware, messageCtrl.updateMessage)

module.exports = router