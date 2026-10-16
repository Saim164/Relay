const conversationRepository = require("../repositories/conversationRepository.js");
const messageRepository = require("../repositories/messageRepository.js");
const { getConversationForUser } = require("./conversationService.js");
const createError = require("../utils/createError.js");

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

const parseMessageQuery = ({ before, limit } = {}) => {
    let parsedBefore;
    if (before !== undefined) {
        if (typeof before !== "string" || Number.isNaN(Date.parse(before))) {
            throw createError("before must be a valid date", 400);
        }
        parsedBefore = new Date(before);
    }

    let parsedLimit = 30;
    if (limit !== undefined) {
        if (typeof limit !== "string") {
            throw createError("limit must be an integer from 1 to 50", 400);
        }

        parsedLimit = Number(limit);
        if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
            throw createError("limit must be an integer from 1 to 50", 400);
        }
    }

    return { before: parsedBefore, limit: parsedLimit };
};

const getMessages = async (conversationId, userId, query) => {
    const { before, limit } = parseMessageQuery(query);
    await getConversationForUser(conversationId, userId);

    const fetchedMessages = await messageRepository.findByConversation(conversationId, { before, limit });
    const hasMore = fetchedMessages.length > limit;
    const messages = fetchedMessages
        .slice(0, limit)
        .reverse()
        .map(toPublicMessage);

    return { messages, hasMore };
};

module.exports = { sendMessage, toPublicMessage, getMessages };
