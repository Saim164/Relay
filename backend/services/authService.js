const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository.js");
const { toPublicUser } = require("./userService.js");
const createError = require("../utils/createError.js");

const TOKEN_LIFETIME = "3d";
const SOCKET_TOKEN_LIFETIME = "1m";
const SOCKET_TOKEN_PURPOSE = "socket";
const SALT_ROUNDS = 10;
// Compared when the email is unknown, so both login failures take the same time.
const DUMMY_PASSWORD_HASH = "$2b$10$bskAnezvMFXjG/C7hfoVgezCTmiZMzIgouHpDF.qdwaJkuUvV6s4.";

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

const createSocketToken = (userId) => jwt.sign(
    { id: userId, purpose: SOCKET_TOKEN_PURPOSE },
    process.env.JWT_SECRET,
    { expiresIn: SOCKET_TOKEN_LIFETIME }
);

const getUserFromToken = async (token, purpose) => {
    if (!token) return null;

    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return null;
    }

    if (payload.purpose !== purpose) return null;

    return userRepository.findPublicById(payload.id);
};

const getUserFromSocketToken = (token) => getUserFromToken(token, SOCKET_TOKEN_PURPOSE);

module.exports = { register, login, createSocketToken, getUserFromToken, getUserFromSocketToken };
