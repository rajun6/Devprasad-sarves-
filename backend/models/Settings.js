const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'Online Service Center' },
  ownerName: { type: String, default: 'Devprasad Baido' },
  ownerPhoto: { type: String, default: '' },
  logo: { type: String, default: '' },
  ownerWhatsApp: { type: String, default: '+918972550281' },
  ownerEmail: { type: String, default: 'devprasad@servicecenter.com' },
  welcomeMessage: { type: String, default: 'Welcome to our Service Center' },
  welcomeMessageBn: { type: String, default: 'আমাদের সেবা কেন্দ্রে স্বাগতম' },
  address: { type: String, default: '' },
  workingHours: { type: String, default: 'Mon-Sat: 9:00 AM - 6:00 PM' },
  socialMedia: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    youtube: { type: String, default: '' }
  },
  updatedAt: { type: Date, default: Date.now }
});

settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
