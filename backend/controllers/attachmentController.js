const attachmentService = require("../services/attachmentService.js");

const signAttachment = async (req, res) => {
    const upload = await attachmentService.createUploadSignature(req.params.id, req.user._id);
    return res.status(200).json({ upload });
};

module.exports = { signAttachment };
