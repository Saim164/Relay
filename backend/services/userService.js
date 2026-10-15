const userRepository = require("../repositories/userRepository.js");

const toPublicUser = (user) => ({
    id: user._id,
    username: user.username,
    email: user.email,
});

const searchUsers = async (username, currentUserId) => {
    const users = await userRepository.searchByUsername(username, currentUserId);
    return users.map(toPublicUser);
};

module.exports = { searchUsers, toPublicUser };
