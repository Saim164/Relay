const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository.js");

const TOKEN_LIFETIME = "3d";
const SALT_ROUNDS = 10;
const DUMMY_PASSWORD_HASH = "$2b$10$bskAnezvMFXjG/C7hfoVgezCTmiZMzIgouHpDF.qdwaJkuUvV6s4.";

const toPublicUser = (user) => ({
    id: user._id,
    username: user.username,
    email: user.email,
});

const register = async ({ username, email, password }) => {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
        const error = new Error("User already exists");
        error.statusCode = 400;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    await userRepository.create({ username, email, password: hashedPassword });
};

const login = async ({ email, password }) => {
    const user = await userRepository.findByEmail(email);
    const passwordHash = user ? user.password : DUMMY_PASSWORD_HASH;
    const passwordMatches = await bcrypt.compare(password, passwordHash);

    if (!user || !passwordMatches) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: TOKEN_LIFETIME,
    });

    return { token, user: toPublicUser(user) };
};

module.exports = { register, login, toPublicUser };
