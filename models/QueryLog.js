const mongoose = require('mongoose');

const QueryLogSchema = new mongoose.Schema({
  queryHash: { type: String, index: true },
  question: { type: String, required: true },
  topic: { type: String, default: 'General' },
  servedFromCache: { type: Boolean, default: false },
  responseTimeMs: { type: Number, default: 0 },
  category: { type: String, default: 'info' },
  createdAt: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('QueryLog', QueryLogSchema);
