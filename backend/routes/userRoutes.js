const router = require("express").Router();
const {
    register,
    login,
    logout,
    getCurrentUser,
    searchUsers,
    getSocketToken,
} = require("../controllers/userController.js");
const authenticate = require("../middleware/authenticate.js");
const { authLimiter } = require("../middleware/rateLimiters.js");
const {
    validateBody,
    validateQuery,
    registerSchema,
    loginSchema,
    searchUsersSchema,
} = require("../middleware/validation.js");

router.post("/register", authLimiter, validateBody(registerSchema), register);
router.post("/login", authLimiter, validateBody(loginSchema), login);
router.post("/logout", logout);
router.get("/me", authenticate, getCurrentUser);
router.get("/search", authenticate, validateQuery(searchUsersSchema), searchUsers);
router.get("/socket-token", authenticate, getSocketToken);

module.exports = router;
