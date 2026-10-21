"use client";

import { useRef, useState } from "react";
import ErrorText from "./ErrorText.jsx";
import { ALLOWED_ATTACHMENT_TYPES, formatFileSize, getFileProblem, isImage } from "../lib/attachments.js";

const MAX_MESSAGE_LENGTH = 2000;

export default function MessageComposer({ onSend, isSending, isDisabled, uploadProgress }) {
  const fileInputRef = useRef(null);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");

  const canSend = (text.trim() || file) && !isSending && !isDisabled;

  function handleFileChange(event) {
    const picked = event.target.files[0];
    event.target.value = "";
    if (!picked) return;

    const problem = getFileProblem(picked);
    setFileError(problem);
    setFile(problem ? null : picked);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSend) return;

    const wasSent = await onSend({ text: text.trim(), file });
    if (!wasSent) return;
    setText("");
    setFile(null);
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-neutral-200 p-4 sm:px-7 sm:py-5">
      {file && (
        <AttachmentChip
          file={file}
          uploadProgress={uploadProgress}
          onRemove={() => setFile(null)}
          canRemove={!isSending}
        />
      )}
      {fileError && <ErrorText className="mb-2">{fileError}</ErrorText>}

      <div className="flex items-end gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_ATTACHMENT_TYPES.join(",")}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          disabled={isSending || isDisabled}
          aria-label="Attach a file"
          className="h-11 w-11 shrink-0 rounded-xl border border-neutral-300 text-xl text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          +
        </button>
        <label htmlFor="message-text" className="sr-only">Write a message</label>
        <textarea
          id="message-text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={MAX_MESSAGE_LENGTH}
          rows={1}
          placeholder="Write a message..."
          className="max-h-32 min-h-11 flex-1 resize-y rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15"
        />
        <button
          type="submit"
          disabled={!canSend}
          className="h-11 rounded-xl bg-neutral-900 px-5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>
    </form>
  );
}

function AttachmentChip({ file, uploadProgress, onRemove, canRemove }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm">
      <span className="min-w-0 truncate text-neutral-800">
        {isImage(file.type) ? "🖼️" : "📄"} {file.name}
        <span className="ml-2 text-xs text-neutral-500">
          {uploadProgress === null ? formatFileSize(file.size) : `Uploading ${uploadProgress}%`}
        </span>
      </span>
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove file"
          className="rounded-md px-2 text-neutral-500 hover:bg-neutral-200"
        >
          ✕
        </button>
      )}
    </div>
  );
}
