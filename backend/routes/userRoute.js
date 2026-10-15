const router = require("express").Router();
const { register, login, getCurrentUser } = require("../controllers/userController.js");
const authenticate = require("../middleware/authenticate.js");
const validateRequest = require("../middleware/validateRequest.js");
const { registerSchema, loginSchema } = require("../middleware/userValidation.js");
const { apiLimiter, authLimiter } = require("../middleware/rateLimiters.js");

router.use(apiLimiter);

router.route("/health").get((req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
});
router.route("/register").post(authLimiter, validateRequest(registerSchema, ["username", "email", "password"]), register);
router.route("/login").post(authLimiter, validateRequest(loginSchema, ["email", "password"]), login);
router.route("/me").get(authenticate, getCurrentUser);

module.exports = router;
