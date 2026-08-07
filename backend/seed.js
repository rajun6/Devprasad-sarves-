const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Service = require('./models/Service');
const Settings = require('./models/Settings');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Service.deleteMany({});
    await Settings.deleteMany({});

    // Create admin user
    const adminUser = await User.create({
      name: 'Devprasad Baido',
      email: 'admin@servicecenter.com',
      mobile: '8972550281',
      password: 'admin123456',
      role: 'admin',
      isActive: true
    });
    console.log('Admin user created');

    // Create default services
    const services = [
      {
        name: 'Aadhaar Services',
        nameBn: 'আধার সার্ভিস',
        category: 'government',
        description: 'Complete Aadhaar card services including new application, update, and correction',
        price: 100,
        processingTime: '7-10 working days',
        isTrending: true,
        isFeatured: true,
        order: 1
      },
      {
        name: 'PAN Card',
        nameBn: 'প্যান কার্ড',
        category: 'government',
        description: 'New PAN card application, correction, and reprint services',
        price: 150,
        processingTime: '15 working days',
        isFeatured: true,
        order: 2
      },
      {
        name: 'Ration Card Correction',
        nameBn: 'রেশন কার্ড সংশোধন',
        category: 'government',
        description: 'Ration card name correction, address update, and new member addition',
        price: 80,
        processingTime: '5-7 working days',
        order: 3
      },
      {
        name: 'Income Certificate',
        nameBn: 'আয়ের শংসাপত্র',
        category: 'government',
        description: 'Income certificate for various purposes including education and loans',
        price: 200,
        processingTime: '3-5 working days',
        isTrending: true,
        order: 4
      },
      {
        name: 'Caste Certificate',
        nameBn: 'জাতিগত শংসাপত্র',
        category: 'government',
        description: 'Caste certificate for SC/ST/OBC categories',
        price: 150,
        processingTime: '5-7 working days',
        order: 5
      },
      {
        name: 'Birth Certificate',
        nameBn: 'জন্ম শংসাপত্র',
        category: 'government',
        description: 'Birth certificate registration and correction services',
        price: 120,
        processingTime: '7-10 working days',
        order: 6
      },
      {
        name: 'Passport Services',
        nameBn: 'পাসপোর্ট সার্ভিস',
        category: 'travel',
        description: 'New passport application, renewal, and Tatkal services',
        price: 500,
        processingTime: '15-30 working days',
        isFeatured: true,
        order: 7
      },
      {
        name: 'Railway Ticket Booking',
        nameBn: 'রেলওয়ে টিকেট বুকিং',
        category: 'travel',
        description: 'Train ticket booking for all classes and routes',
        price: 30,
        processingTime: 'Instant',
        order: 8
      },
      {
        name: 'Flight Ticket Booking',
        nameBn: 'ফ্লাইট টিকেট বুকিং',
        category: 'travel',
        description: 'Domestic and international flight ticket booking at best prices',
        price: 100,
        processingTime: 'Instant',
        order: 9
      },
      {
        name: 'Electricity Bill Payment',
        nameBn: 'বিদ্যুৎ বিল পেমেন্ট',
        category: 'utility',
        description: 'Online electricity bill payment for all states',
        price: 10,
        processingTime: 'Instant',
        order: 10
      },
      {
        name: 'Money Transfer',
        nameBn: 'মানি ট্রান্সফার',
        category: 'financial',
        description: 'Domestic money transfer services through all major banks',
        price: 25,
        processingTime: 'Instant',
        order: 11
      },
      {
        name: 'Resume Making',
        nameBn: 'রেজুমে তৈরি',
        category: 'professional',
        description: 'Professional resume and CV making services',
        price: 200,
        processingTime: '1-2 working days',
        order: 12
      },
      {
        name: 'PDF Conversion',
        nameBn: 'পিডিএফ কনভার্শন',
        category: 'professional',
        description: 'Convert documents to PDF and PDF to other formats',
        price: 50,
        processingTime: 'Same day',
        order: 13
      },
      {
        name: 'Website Development',
        nameBn: 'ওয়েবসাইট ডেভেলপমেন্ট',
        category: 'professional',
        description: 'Custom website development for businesses and individuals',
        price: 5000,
        processingTime: '7-15 working days',
        isTrending: true,
        isFeatured: true,
        order: 14
      },
      {
        name: 'Scholarship Form Fill-up',
        nameBn: 'স্কলারশিপ ফর্ম পূরণ',
        category: 'government',
        description: 'Help with filling scholarship application forms for various schemes',
        price: 100,
        processingTime: '1-2 working days',
        order: 15
      },
      {
        name: 'Mobile Recharge',
        nameBn: 'মোবাইল রিচার্জ',
        category: 'utility',
        description: 'Prepaid and postpaid mobile recharge for all operators',
        price: 5,
        processingTime: 'Instant',
        order: 16
      }
    ];

    await Service.insertMany(services);
    console.log('Default services created');

    // Create default settings
    await Settings.create({
      siteName: 'Online Service Center',
      ownerName: 'Devprasad Baido',
      ownerWhatsApp: '+918972550281',
      ownerEmail: 'devprasad@servicecenter.com',
      welcomeMessage: 'Welcome to our Online Service Center. We provide all types of government and private services at your doorstep.',
      welcomeMessageBn: 'আমাদের অনলাইন সার্ভিস সেন্টারে স্বাগতম। আমরা আপনার দোরগোড়ায় সমস্ত ধরণের সরকারি এবং বেসরকারি পরিষেবা প্রদান করি।',
      workingHours: 'Mon-Sat: 9:00 AM - 6:00 PM'
    });
    console.log('Default settings created');

    console.log('Seed data completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed data error:', error);
    process.exit(1);
  }
};

seedData();