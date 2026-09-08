const mongoose = require('mongoose');

const KnowledgeBaseSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  category: { type: String, required: true, index: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  keywords: [{ type: String, index: true }],
  updatedAt: { type: Date, default: Date.now }
});

// Text index for ultra-fast full text search across KB entries
KnowledgeBaseSchema.index({ title: 'text', content: 'text', keywords: 'text' });

module.exports = mongoose.model('KnowledgeBase', KnowledgeBaseSchema);
