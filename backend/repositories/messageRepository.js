const Message = require("../models/messageModel.js");

const create = (data) => Message.create(data);

// Newest first, so `limit` picks the most recent messages before `before`.
const findByConversation = (conversationId, { before, limit }) => {
    const filter = { conversation: conversationId };
    if (before) {
        filter.createdAt = { $lt: before };
    }

    return Message.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit);
};

module.exports = { create, findByConversation };
