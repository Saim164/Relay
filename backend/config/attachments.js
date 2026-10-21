const ALLOWED_ATTACHMENT_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
];

const ALLOWED_ATTACHMENT_FORMATS = "jpg,jpeg,png,webp,gif,pdf";

const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;

const attachmentFolder = (conversationId) => `relay/${conversationId}`;

module.exports = {
    ALLOWED_ATTACHMENT_TYPES,
    ALLOWED_ATTACHMENT_FORMATS,
    MAX_ATTACHMENT_SIZE,
    attachmentFolder,
};
