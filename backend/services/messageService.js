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

module.exports = { sendMessage, toPublicMessage };
