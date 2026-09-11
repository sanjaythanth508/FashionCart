const mongoose = require('mongoose');

const InventoryLogSchema = new mongoose.Schema({
  productId: {
    type: Number,
    required: true,
    index: true
  },
  productName: {
    type: String,
    required: true
  },
  changeType: {
    type: String,
    enum: ['restock', 'order_sale', 'cancellation_restock', 'manual_adjustment'],
    required: true
  },
  changeAmount: {
    type: Number,
    required: true
  },
  previousStock: {
    type: Number,
    required: true
  },
  newStock: {
    type: Number,
    required: true
  },
  orderId: {
    type: String,
    default: null
  },
  performedBy: {
    type: String,
    default: 'System'
  },
  note: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('InventoryLog', InventoryLogSchema);
