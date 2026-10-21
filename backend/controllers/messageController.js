const messageService = require("../services/messageService.js");

const sendMessage = async (req, res) => {
    const message = await messageService.sendMessage(
        req.params.id,
        req.user._id,
        req.validatedBody
    );

    return res.status(201).json({ message });
};

const listMessages = async (req, res) => {
    const result = await messageService.getMessages(
        req.params.id,
        req.user._id,
        req.validatedQuery
    );

    return res.status(200).json(result);
};

module.exports = { sendMessage, listMessages };
