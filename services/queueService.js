/**
 * Asynchronous Message Queue & Batch Writer
 * Decouples database write operations (Query Logging, Ticket Generation)
 * from synchronous HTTP request worker threads.
 * Prevents DB overload during 100k student surge traffic.
 */

const Ticket = require('../models/Ticket');
const QueryLog = require('../models/QueryLog');

class QueueService {
  constructor() {
    this.ticketQueue = [];
    this.logQueue = [];
    this.isProcessing = false;
    this.batchSize = 50;

    // Flush queued writes every 2 seconds
    setInterval(() => this.flush(), 2000);
  }

  enqueueTicket(ticketData) {
    this.ticketQueue.push(ticketData);
    if (this.ticketQueue.length >= this.batchSize) {
      this.flush();
    }
  }

  enqueueLog(logData) {
    this.logQueue.push(logData);
    if (this.logQueue.length >= this.batchSize * 2) {
      this.flush();
    }
  }

  async flush() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      // 1. Process batch tickets
      if (this.ticketQueue.length > 0) {
        const batch = this.ticketQueue.splice(0, this.batchSize);
        try {
          await Ticket.insertMany(batch, { ordered: false });
        } catch (dbErr) {
          // Fallback individual insert on partial duplicate
          for (const item of batch) {
            try { await new Ticket(item).save(); } catch (_) {}
          }
        }
      }

      // 2. Process batch query logs
      if (this.logQueue.length > 0) {
        const batch = this.logQueue.splice(0, this.batchSize * 2);
        try {
          await QueryLog.insertMany(batch, { ordered: false });
        } catch (_) {}
      }
    } catch (err) {
      console.error('[QueueService Flush Error]:', err.message);
    } finally {
      this.isProcessing = false;
    }
  }
}

module.exports = new QueueService();
