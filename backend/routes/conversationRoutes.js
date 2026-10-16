const router = require("express").Router();
const { start, list } = require("../controllers/conversationController.js");
const { send, list: listMessages } = require("../controllers/messageController.js");
const authenticate = require("../middleware/authenticate.js");
const validateRequest = require("../middleware/validateRequest.js");
const { conversationSchema, messageSchema } = require("../middleware/userValidation.js");

router.get("/", authenticate, list);
router.post(
    "/",
    authenticate,
    validateRequest(conversationSchema, ["userId"]),
    start
);
router.post(
    "/:id/messages",
    authenticate,
    validateRequest(messageSchema, ["text"]),
    send
);
router.get("/:id/messages", authenticate, listMessages);

module.exports = router;
