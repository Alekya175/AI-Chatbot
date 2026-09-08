const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true, index: true },
  studentId: { type: String, required: true, index: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, default: '' },
  regNo: { type: String, default: '' },
  question: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['complaint', 'faculty', 'personal', 'request', 'general'], 
    default: 'general',
    index: true 
  },
  topic: { type: String, default: 'General Issue' },
  status: { 
    type: String, 
    enum: ['pending', 'answered', 'resolved'], 
    default: 'pending',
    index: true 
  },
  answer: { type: String, default: '' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  createdAt: { type: Date, default: Date.now, index: true },
  answeredAt: { type: Date, default: null }
});

// Composite index for fast student ticket history lookups and admin status filters
TicketSchema.index({ studentId: 1, createdAt: -1 });
TicketSchema.index({ status: 1, category: 1, createdAt: -1 });

module.exports = mongoose.model('Ticket', TicketSchema);
