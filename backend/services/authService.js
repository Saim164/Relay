const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository.js");
const { toPublicUser } = require("./userService.js");
const createError = require("../utils/createError.js");

const TOKEN_LIFETIME = "3d";
const SALT_ROUNDS = 10;
// Compared against when the email doesn't exist, so a login takes the same time
// whether or not the account exists (prevents guessing emails by response time).
const DUMMY_PASSWORD_HASH = "$2b$10$bskAnezvMFXjG/C7hfoVgezCTmiZMzIgouHpDF.qdwaJkuUvV6s4.";

// A taken username or email is rejected by the unique index (409 in errorHandler).
const register = async ({ username, email, password }) => {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    await userRepository.create({ username, email, password: hashedPassword });
};

const login = async ({ email, password }) => {
    const user = await userRepository.findByEmail(email);
    const passwordHash = user ? user.password : DUMMY_PASSWORD_HASH;
    const passwordMatches = await bcrypt.compare(password, passwordHash);

    if (!user || !passwordMatches) {
        throw createError("Invalid email or password", 401);
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: TOKEN_LIFETIME,
    });

    return { token, user: toPublicUser(user) };
};

module.exports = { register, login };
