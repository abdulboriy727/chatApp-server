const router = require("express").Router()
const userCtrl = require("../controller/userCtrl")
const userMiddleware = require("../middleware/userMiddleware")

router.get("/users", userCtrl.getAll)
router.get("/user/:id", userCtrl.getOne)
router.delete("/user/:id", userMiddleware, userCtrl.deleteUser)
router.put("/user/:id", userMiddleware, userCtrl.updateUser)

module.exports = router