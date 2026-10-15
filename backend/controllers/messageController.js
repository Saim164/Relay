const messageService = require("../services/messageService.js");

const send = async (req, res) => {
    const message = await messageService.sendMessage(
        req.params.id,
        req.user._id,
        req.validatedBody.text
    );

    return res.status(201).json({ message });
};

const list = async (req, res) => {
    const result = await messageService.getMessages(req.params.id, req.user._id, {
        before: req.query.before,
        limit: req.query.limit,
    });

    return res.status(200).json(result);
};

module.exports = { send, list };
