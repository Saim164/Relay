const cloudinary = require("../config/cloudinary.js");
const { ALLOWED_ATTACHMENT_FORMATS, attachmentFolder } = require("../config/attachments.js");
const { getConversationForUser } = require("./conversationService.js");

const createUploadSignature = async (conversationId, userId) => {
    await getConversationForUser(conversationId, userId);

    const params = {
        allowed_formats: ALLOWED_ATTACHMENT_FORMATS,
        folder: attachmentFolder(conversationId),
        timestamp: Math.round(Date.now() / 1000),
    };
    const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);

    return {
        ...params,
        signature,
        apiKey: process.env.CLOUDINARY_API_KEY,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    };
};

module.exports = { createUploadSignature };
