const conversationService = require("../services/conversationService.js");

const startConversation = async (req, res) => {
    const conversation = await conversationService.startConversation(
        req.user._id,
        req.validatedBody.userId
    );

    return res.status(200).json({ conversation });
};

const listConversations = async (req, res) => {
    const conversations = await conversationService.getUserConversations(req.user._id);
    return res.status(200).json({ conversations });
};

module.exports = { startConversation, listConversations };
