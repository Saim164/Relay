const conversationService = require("../services/conversationService.js");

const start = async (req, res) => {
    const conversation = await conversationService.startConversation(
        req.user._id,
        req.validatedBody.userId
    );

    return res.status(200).json({ conversation });
};

module.exports = { start };
