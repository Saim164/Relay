const userRepository = require("../repositories/userRepository.js");

const toPublicUser = (user) => ({
    id: user._id,
    username: user.username,
    email: user.email,
});

const toUserSummary = (user) => ({
    id: user._id,
    username: user.username,
});

const searchUsers = async (username, currentUserId) => {
    const users = await userRepository.searchByUsername(username, currentUserId);
    return users.map(toUserSummary);
};

module.exports = { toPublicUser, searchUsers };
