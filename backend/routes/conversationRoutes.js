const router = require("express").Router();
const { startConversation, listConversations } = require("../controllers/conversationController.js");
const { sendMessage, listMessages } = require("../controllers/messageController.js");
const authenticate = require("../middleware/authenticate.js");
const {
    validateBody,
    validateQuery,
    startConversationSchema,
    sendMessageSchema,
    listMessagesSchema,
} = require("../middleware/validation.js");

// Every conversation route needs a logged-in user.
router.use(authenticate);

router.get("/", listConversations);
router.post("/", validateBody(startConversationSchema), startConversation);
router.get("/:id/messages", validateQuery(listMessagesSchema), listMessages);
router.post("/:id/messages", validateBody(sendMessageSchema), sendMessage);

module.exports = router;
