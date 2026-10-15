const Message = require("../models/message.Model.js");

const create = (data) => {
    const message = new Message(data);
    return message.save();
};

module.exports = { create };
