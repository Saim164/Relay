const TYPE_BY_FORMAT = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    pdf: "application/pdf",
};

const ALLOWED_ATTACHMENT_FORMATS = Object.keys(TYPE_BY_FORMAT).join(",");

const ALLOWED_ATTACHMENT_TYPES = [...new Set(Object.values(TYPE_BY_FORMAT))];

const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;

const attachmentFolder = (conversationId) => `relay/${conversationId}`;

module.exports = {
    TYPE_BY_FORMAT,
    ALLOWED_ATTACHMENT_FORMATS,
    ALLOWED_ATTACHMENT_TYPES,
    MAX_ATTACHMENT_SIZE,
    attachmentFolder,
};
