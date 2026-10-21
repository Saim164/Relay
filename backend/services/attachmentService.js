const cloudinary = require("../config/cloudinary.js");
const {
    TYPE_BY_FORMAT,
    ALLOWED_ATTACHMENT_FORMATS,
    MAX_ATTACHMENT_SIZE,
    attachmentFolder,
} = require("../config/attachments.js");
const { getConversationForUser } = require("./conversationService.js");
const createError = require("../utils/createError.js");

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

const findUploadedFile = async (publicId) => {
    try {
        return await cloudinary.api.resource(publicId, { resource_type: "image" });
    } catch {
        return null;
    }
};

// Trust only what Cloudinary reports about the file, never what the browser sends.
const verifyAttachment = async (conversationId, { publicId, name }) => {
    const file = await findUploadedFile(publicId);
    const fileFolder = file?.asset_folder ?? file?.folder;

    if (!file || fileFolder !== attachmentFolder(conversationId)) {
        throw createError("Attachment not found", 400);
    }

    const type = TYPE_BY_FORMAT[file.format];
    if (!type || file.bytes > MAX_ATTACHMENT_SIZE) {
        throw createError("This file is not allowed", 400);
    }

    return { publicId, url: file.secure_url, name, type, size: file.bytes };
};

module.exports = { createUploadSignature, verifyAttachment };
