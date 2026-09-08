const mongoose = require('mongoose');

const ChatHistorySchema = new mongoose.Schema({
  chatId: { type: String, required: true, index: true },
  userEmail: { type: String, default: 'guest', index: true },
  userName: { type: String, default: 'Guest Student' },
  topic: { type: String, default: 'General' },
  language: { type: String, default: 'en' },
  messages: [{
    sender: { type: String, enum: ['user', 'ai'], required: true },
    text: { type: String, required: true },
    translatedText: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatHistory', ChatHistorySchema);
