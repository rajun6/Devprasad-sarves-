const User = require('../models/User');
const Service = require('../models/Service');
const Order = require('../models/Order');
const Settings = require('../models/Settings');
const { uploadFile } = require('../utils/cloudinaryService');

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalServices, totalOrders, pendingOrders] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Service.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' })
    ]);
    const recentOrders = await Order.find().populate('service','name price').populate('user','name email').sort('-createdAt').limit(10);
    res.json({ success: true, data: { totalUsers, totalServices, totalOrders, pendingOrders, recentOrders } });
  } catch (e) { res.status(500).json({ success: false }); }
};

exports.createService = async (req, res) => {
  try {
    const data = { name: req.body.name, nameBn: req.body.nameBn||'', category: req.body.category||'other', description: req.body.description||'', price: Number(req.body.price)||0, processingTime: req.body.processingTime||'2-3 days', isTrending: req.body.isTrending==='true'||req.body.isTrending===true, isFeatured: req.body.isFeatured==='true'||req.body.isFeatured===true, isActive: true };
    if(req.file){ const r = await uploadFile(req.file.path); data.image = r.url; }
    const service = await Service.create(data);
    res.status(201).json({ success: true, data: service });
  } catch (e) { res.status(500).json({ success: false }); }
};

exports.updateService = async (req, res) => {
  try {
    const data = {};
    if(req.body.name) data.name=req.body.name;
    if(req.body.nameBn!==undefined) data.nameBn=req.body.nameBn;
    if(req.body.category) data.category=req.body.category;
    if(req.body.description) data.description=req.body.description;
    if(req.body.price) data.price=Number(req.body.price);
    if(req.body.processingTime) data.processingTime=req.body.processingTime;
    if(req.body.isTrending!==undefined) data.isTrending=req.body.isTrending==='true'||req.body.isTrending===true;
    if(req.body.isFeatured!==undefined) data.isFeatured=req.body.isFeatured==='true'||req.body.isFeatured===true;
    if(req.file){ const r = await uploadFile(req.file.path); data.image = r.url; }
    const service = await Service.findByIdAndUpdate(req.params.id, data, {new:true});
    res.json({ success: true, data: service });
  } catch (e) { res.status(500).json({ success: false }); }
};

exports.deleteService = async (req, res) => {
  try { await Service.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (e) { res.status(500).json({ success: false }); }
};

exports.getAllOrders = async (req, res) => {
  try {
    const query = {};
    if(req.query.status&&req.query.status!=='all') query.status=req.query.status;
    const orders = await Order.find(query).populate('service','name price').populate('user','name email').sort('-createdAt').limit(100);
    res.json({ success: true, data: orders });
  } catch (e) { res.status(500).json({ success: false }); }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false }); }
};

exports.deleteOrder = async (req, res) => {
  try { await Order.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (e) { res.status(500).json({ success: false }); }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json({ success: true, data: users });
  } catch (e) { res.status(500).json({ success: false }); }
};

exports.updateUserStatus = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false }); }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if(!user) return res.status(404).json({ success: false });
    if(user.role==='admin') return res.status(400).json({ success: false });
    await Order.deleteMany({ user: req.params.id });
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false }); }
};

exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json({ success: true, data: settings });
  } catch (e) { res.status(500).json({ success: false }); }
};

exports.updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    const data = { ...req.body };
    if(req.files){
      if(req.files.ownerPhoto&&req.files.ownerPhoto[0]){ const r = await uploadFile(req.files.ownerPhoto[0].path); data.ownerPhoto = r.url; }
      if(req.files.logo&&req.files.logo[0]){ const r = await uploadFile(req.files.logo[0].path); data.logo = r.url; }
    }
    if(!settings) settings = await Settings.create(data);
    else settings = await Settings.findByIdAndUpdate(settings._id, data, {new:true});
    res.json({ success: true, data: settings });
  } catch (e) { res.status(500).json({ success: false }); }
};
