const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  nameBn: { type: String, trim: true },
  category: { type: String, required: true, enum: ['government', 'financial', 'travel', 'utility', 'professional', 'other'] },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  processingTime: { type: String, default: '2-3 working days' },
  image: { type: String, default: 'default-service.jpg' },
  isActive: { type: Boolean, default: true },
  isTrending: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

serviceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Service', serviceSchema);
