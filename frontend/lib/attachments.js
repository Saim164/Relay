export const ALLOWED_ATTACHMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;

export function isImage(type) {
  return type.startsWith("image/");
}

export function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileProblem(file) {
  if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) return "This file type is not allowed";
  if (file.size > MAX_ATTACHMENT_SIZE) return "File must be 10 MB or smaller";
  if (file.size === 0) return "File is empty";
  return "";
}
