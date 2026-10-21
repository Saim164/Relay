import { apiRequest } from "./api.js";

export async function uploadAttachment(conversationId, file, onProgress) {
  const { upload } = await apiRequest(`/conversations/${conversationId}/attachments/sign`, {
    method: "POST",
    body: { name: file.name, type: file.type, size: file.size },
  });

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", upload.apiKey);
  form.append("timestamp", upload.timestamp);
  form.append("signature", upload.signature);
  form.append("folder", upload.folder);
  form.append("allowed_formats", upload.allowed_formats);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${upload.cloudName}/auto/upload`;
  const result = await sendWithProgress(uploadUrl, form, onProgress);

  return { publicId: result.public_id, name: file.name };
}

// fetch can't report upload progress, so this one request uses XMLHttpRequest.
function sendWithProgress(url, form, onProgress) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", url);

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };

    request.onload = () => {
      let result = {};
      try {
        result = JSON.parse(request.responseText);
      } catch {
        result = {};
      }

      if (request.status >= 200 && request.status < 300) resolve(result);
      else reject(new Error(result.error?.message || "Upload failed. Please try again."));
    };

    request.onerror = () => reject(new Error("Upload failed. Please check your connection."));
    request.send(form);
  });
}
