const userRepository = require("../repositories/userRepository.js");

// Only for the logged-in user themselves (it includes their email).
const toPublicUser = (user) => ({
    id: user._id,
    username: user.username,
    email: user.email,
});

// What other people are allowed to see about a user.
const toUserSummary = (user) => ({
    id: user._id,
    username: user.username,
});

const searchUsers = async (username, currentUserId) => {
    const users = await userRepository.searchByUsername(username, currentUserId);
    return users.map(toUserSummary);
};

module.exports = { toPublicUser, searchUsers };
