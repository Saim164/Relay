const conversationRepository = require("../repositories/conversationRepository.js");
const messageRepository = require("../repositories/messageRepository.js");
const { getConversationForUser } = require("./conversationService.js");

const toPublicMessage = (message) => ({
    id: String(message._id),
    conversationId: String(message.conversation),
    senderId: String(message.sender),
    text: message.text,
    createdAt: message.createdAt,
});

const sendMessage = async (conversationId, senderId, text) => {
    await getConversationForUser(conversationId, senderId);

    const message = await messageRepository.create({
        conversation: conversationId,
        sender: senderId,
        text,
    });

    await conversationRepository.updateLastMessage(conversationId, {
        text: message.text,
        sender: senderId,
        createdAt: message.createdAt,
    });

    return toPublicMessage(message);
};

const getMessages = async (conversationId, userId, { before, limit }) => {
    await getConversationForUser(conversationId, userId);

    const newestFirst = await messageRepository.findByConversation(conversationId, {
        before,
        limit: limit + 1,
    });
    const hasMore = newestFirst.length > limit;
    const messages = newestFirst
        .slice(0, limit)
        .reverse()
        .map(toPublicMessage);

    return { messages, hasMore };
};

module.exports = { sendMessage, getMessages };
