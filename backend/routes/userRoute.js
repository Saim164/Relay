const router = require("express").Router();
const { register, login, logout, getCurrentUser, searchUsers } = require("../controllers/userController.js");
const authenticate = require("../middleware/authenticate.js");
const validateRequest = require("../middleware/validateRequest.js");
const validateQuery = require("../middleware/validateQuery.js");
const { registerSchema, loginSchema, searchUsersSchema } = require("../middleware/userValidation.js");
const { authLimiter } = require("../middleware/rateLimiters.js");

router.route("/register").post(authLimiter, validateRequest(registerSchema, ["username", "email", "password"]), register);
router.route("/login").post(authLimiter, validateRequest(loginSchema, ["email", "password"]), login);
router.route("/logout").post(logout);
router.route("/health").get((req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
});
router.route("/me").get(authenticate, getCurrentUser);
router.route("/search").get(authenticate, validateQuery(searchUsersSchema), searchUsers);

module.exports = router;
