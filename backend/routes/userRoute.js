const router = require("express").Router();
const { register, login, getCurrentUser } = require("../controllers/userController.js");
const authenticate = require("../middleware/authenticate.js");

router.route("/health").get((req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
});
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/me").get(authenticate, getCurrentUser);

module.exports = router;
