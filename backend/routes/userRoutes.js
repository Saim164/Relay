const router = require("express").Router();
const { register, login, logout, getCurrentUser, searchUsers } = require("../controllers/userController.js");
const authenticate = require("../middleware/authenticate.js");
const validateRequest = require("../middleware/validateRequest.js");
const validateQuery = require("../middleware/validateQuery.js");
const { registerSchema, loginSchema, searchUsersSchema } = require("../middleware/userValidation.js");
const { authLimiter } = require("../middleware/rateLimiters.js");

router.post(
    "/register",
    authLimiter,
    validateRequest(registerSchema, ["username", "email", "password"]),
    register
);
router.post("/login", authLimiter, validateRequest(loginSchema, ["email", "password"]), login);
router.post("/logout", logout);
router.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
});
router.get("/me", authenticate, getCurrentUser);
router.get("/search", authenticate, validateQuery(searchUsersSchema), searchUsers);

module.exports = router;
