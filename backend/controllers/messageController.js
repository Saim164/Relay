const messageService = require("../services/messageService.js");

const send = async (req, res) => {
    const message = await messageService.sendMessage(
        req.params.id,
        req.user._id,
        req.validatedBody.text
    );

    return res.status(201).json({ message });
};

module.exports = { send };
