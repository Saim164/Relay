const router = require("express").Router();
const { start } = require("../controllers/conversationController.js");
const authenticate = require("../middleware/authenticate.js");
const validateRequest = require("../middleware/validateRequest.js");
const { conversationSchema } = require("../middleware/userValidation.js");

router.post("/", authenticate, validateRequest(conversationSchema, ["userId"]), start);

module.exports = router;
