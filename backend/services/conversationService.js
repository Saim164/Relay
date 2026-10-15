const conversationRepository = require("../repositories/conversationRepository.js");
const userRepository = require("../repositories/userRepository.js");

const makeKey = (a, b) => [String(a), String(b)].sort().join("_");

const createError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const toPublic = (conversation, myId) => {
    const otherUser = conversation.participants.find(
        (participant) => String(participant._id) !== String(myId)
    );
    const lastMessage = conversation.lastMessage;
    const hasLastMessage = lastMessage && [
        lastMessage.text,
        lastMessage.sender,
        lastMessage.createdAt,
    ].some((value) => value != null);

    return {
        id: conversation._id,
        otherUser: {
            id: otherUser._id,
            username: otherUser.username,
        },
        lastMessage: hasLastMessage ? lastMessage : null,
        updatedAt: conversation.updatedAt,
    };
};

const startConversation = async (myId, otherUserId) => {
    if (String(myId) === String(otherUserId)) {
        throw createError("You can't start a chat with yourself", 400);
    }

    const otherUser = await userRepository.findById(otherUserId);
    if (!otherUser) {
        throw createError("User not found", 404);
    }

    const participantsKey = makeKey(myId, otherUserId);
    let conversation = await conversationRepository.findByKey(participantsKey);

    if (!conversation) {
        try {
            conversation = await conversationRepository.create({
                participants: [myId, otherUserId],
                participantsKey,
            });
        } catch (error) {
            if (error.code !== 11000) {
                throw error;
            }

            // Another request may have created this pair at the same time.
            conversation = await conversationRepository.findByKey(participantsKey);
            if (!conversation) {
                throw error;
            }
        }
    }

    return toPublic(conversation, myId);
};

module.exports = { startConversation, makeKey, toPublic };
