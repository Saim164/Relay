"use client";

import { useState } from "react";

const MAX_MESSAGE_LENGTH = 2000;

export default function MessageComposer({ onSend, isSending, isDisabled }) {
  const [text, setText] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const wasSent = await onSend(text.trim());
    if (wasSent) setText("");
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-neutral-200 p-4 sm:px-7 sm:py-5">
      <div className="flex items-end gap-3">
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
          disabled={isSending || !text.trim() || isDisabled}
          className="h-11 rounded-xl bg-neutral-900 px-5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>
    </form>
  );
}
