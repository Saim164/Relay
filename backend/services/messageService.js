const conversationRepository = require("../repositories/conversationRepository.js");
const messageRepository = require("../repositories/messageRepository.js");
const { getConversationForUser, toPublicConversation } = require("./conversationService.js");
const { verifyAttachment } = require("./attachmentService.js");
const { SOCKET_EVENTS, notifyUser } = require("../socket.js");

const toPublicMessage = (message) => ({
    id: String(message._id),
    conversationId: String(message.conversation),
    senderId: String(message.sender),
    text: message.text,
    attachment: message.attachment
        ? {
            url: message.attachment.url,
            name: message.attachment.name,
            type: message.attachment.type,
            size: message.attachment.size,
        }
        : null,
    createdAt: message.createdAt,
});

const previewText = (message) => message.text || `📎 ${message.attachment.name}`;

const sendMessage = async (conversationId, senderId, { text, attachment }) => {
    const conversation = await getConversationForUser(conversationId, senderId);
    const verifiedAttachment = attachment
        ? await verifyAttachment(conversationId, attachment)
        : undefined;

    const message = await messageRepository.create({
        conversation: conversationId,
        sender: senderId,
        text: text || undefined,
        attachment: verifiedAttachment,
    });

    await conversationRepository.updateLastMessage(conversationId, {
        text: previewText(message),
        sender: senderId,
        createdAt: message.createdAt,
    });

    const publicMessage = toPublicMessage(message);

    conversation.participants.forEach((participant) => {
        notifyUser(participant._id, SOCKET_EVENTS.NEW_MESSAGE, {
            message: publicMessage,
            conversation: toPublicConversation(conversation, participant._id),
        });
    });

    return publicMessage;
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
