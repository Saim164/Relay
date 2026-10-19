const Conversation = require("../models/conversationModel.js");

const PUBLIC_PARTICIPANTS = { path: "participants", select: "username" };

const findByKey = (participantsKey) => Conversation.findOne({ participantsKey }).populate(PUBLIC_PARTICIPANTS);

const findById = (id) => Conversation.findById(id).populate(PUBLIC_PARTICIPANTS);

const findByParticipant = (userId) => Conversation.find({ participants: userId })
    .sort({ updatedAt: -1 })
    .populate(PUBLIC_PARTICIPANTS);

const create = async (data) => {
    const conversation = await Conversation.create(data);
    return conversation.populate(PUBLIC_PARTICIPANTS);
};

const updateLastMessage = (conversationId, lastMessage) => Conversation.findByIdAndUpdate(
    conversationId,
    { $set: { lastMessage } },
    { runValidators: true }
);

module.exports = { findByKey, findById, findByParticipant, create, updateLastMessage };
