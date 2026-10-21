const router = require("express").Router();
const { startConversation, listConversations } = require("../controllers/conversationController.js");
const { sendMessage, listMessages } = require("../controllers/messageController.js");
const { signAttachment } = require("../controllers/attachmentController.js");
const authenticate = require("../middleware/authenticate.js");
const {
    validateBody,
    validateQuery,
    startConversationSchema,
    sendMessageSchema,
    listMessagesSchema,
    signAttachmentSchema,
} = require("../middleware/validation.js");

router.use(authenticate);

router.get("/", listConversations);
router.post("/", validateBody(startConversationSchema), startConversation);
router.get("/:id/messages", validateQuery(listMessagesSchema), listMessages);
router.post("/:id/messages", validateBody(sendMessageSchema), sendMessage);
router.post("/:id/attachments/sign", validateBody(signAttachmentSchema), signAttachment);

module.exports = router;
