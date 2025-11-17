import mongoose from "mongoose";

const AiEventSchema = new mongoose.Schema(
  {
    userId: { type: String, index: true },
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation" },
    feature: { type: String, index: true },
    type: {
      type: String,
      enum: [
        "thumbs_up",
        "thumbs_down",
        "copy_response",
        "regenerate",
        "bug_report",
      ],
      required: true,
    },
    meta: {}, // free-form JSON for extra fields
  },
  { timestamps: true }
);

export const AiEvent = mongoose.model("AiEvent", AiEventSchema);
