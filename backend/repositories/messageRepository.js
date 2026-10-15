const Message = require("../models/message.Model.js");

const create = (data) => {
    const message = new Message(data);
    return message.save();
};

const findByConversation = (conversationId, { before, limit }) => {
    const filter = { conversation: conversationId };
    if (before) {
        filter.createdAt = { $lt: before };
    }

    return Message.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit + 1);
};

module.exports = { create, findByConversation };
