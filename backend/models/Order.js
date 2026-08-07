const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  customService: { type: String, trim: true },
  orderNumber: { type: String, unique: true },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'rejected', 'cancelled'], default: 'pending' },
  workDescription: { type: String, required: true },
  documents: [{ public_id: String, url: String, originalName: String, uploadedAt: { type: Date, default: Date.now } }],
  customerDetails: { name: { type: String, required: true }, mobile: { type: String, required: true }, email: { type: String, required: true } },
  adminNotes: String,
  completedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `SC${String(count + 1).padStart(6, '0')}`;
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', orderSchema);
