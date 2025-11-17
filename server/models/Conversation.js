// src/models/Conversation.js
import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, required: true },
  },
  { _id: false }
);

const ConversationSchema = new mongoose.Schema(
  {
    userId: { type: String, index: true }, // your app’s user id
    feature: { type: String, index: true }, // e.g. "doc-summary", "chatbot"
    messages: [MessageSchema],
    model: String,
    usage: {
      inputTokens: Number,
      outputTokens: Number,
      totalTokens: Number,
    },
    latencyMs: Number,
    rating: { type: Number, min: 1, max: 5 }, // optional user rating
    tags: [String],
  },
  { timestamps: true }
);

export const Conversation = mongoose.model("Conversation", ConversationSchema);
