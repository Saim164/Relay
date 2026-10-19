const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository.js");
const { toPublicUser } = require("./userService.js");
const createError = require("../utils/createError.js");

const TOKEN_LIFETIME = "3d";
const SALT_ROUNDS = 10;
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

const getUserFromToken = async (token) => {
    if (!token) return null;

    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return null;
    }

    return userRepository.findPublicById(payload.id);
};

module.exports = { register, login, getUserFromToken };
