const Conversation = require("../models/conversationModel.js");

const withPublicParticipants = (query) => query.populate({
    path: "participants",
    select: "username",
});

const findByKey = (key) => withPublicParticipants(Conversation.findOne({ participantsKey: key }));

const create = async (data) => {
    const conversation = await Conversation.create(data);
    return conversation.populate({ path: "participants", select: "username" });
};

const findById = (id) => withPublicParticipants(Conversation.findById(id));

const findByParticipant = (userId) => withPublicParticipants(
    Conversation.find({ participants: userId }).sort({ updatedAt: -1 })
);

module.exports = { findByKey, create, findById, findByParticipant };
