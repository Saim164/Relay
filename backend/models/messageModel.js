const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
    {
        publicId: { type: String, required: true },
        url: { type: String, required: true },
        name: { type: String, required: true },
        type: { type: String, required: true },
        size: { type: Number, required: true },
    },
    { _id: false }
);

const messageSchema = new mongoose.Schema(
    {
        conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },

        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

        text: {
            type: String,
            trim: true,
            maxlength: 2000,
            required: [function () {
                return !this.attachment;
            }, "A message needs text or an attachment"],
        },

        attachment: attachmentSchema,
    },
    { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);
