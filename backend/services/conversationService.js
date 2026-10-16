const mongoose = require("mongoose");
const conversationRepository = require("../repositories/conversationRepository.js");
const userRepository = require("../repositories/userRepository.js");
const createError = require("../utils/createError.js");

const makeKey = (a, b) => [String(a), String(b)].sort().join("_");

const toPublicConversation = (conversation, myId) => {
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

            conversation = await conversationRepository.findByKey(participantsKey);
            if (!conversation) {
                throw error;
            }
        }
    }

    return toPublicConversation(conversation, myId);
};

const getUserConversations = async (myId) => {
    const conversations = await conversationRepository.findByParticipant(myId);
    return conversations.map((conversation) => toPublicConversation(conversation, myId));
};

const getConversationForUser = async (conversationId, userId) => {
    if (!mongoose.isValidObjectId(conversationId) || !/^[a-f\d]{24}$/i.test(conversationId)) {
        throw createError("Conversation not found", 404);
    }

    const conversation = await conversationRepository.findById(conversationId);
    const isParticipant = conversation?.participants.some(
        (participant) => String(participant._id) === String(userId)
    );

    if (!conversation || !isParticipant) {
        throw createError("Conversation not found", 404);
    }

    return conversation;
};

module.exports = {
    startConversation,
    getUserConversations,
    getConversationForUser,
    makeKey,
    toPublicConversation,
};
