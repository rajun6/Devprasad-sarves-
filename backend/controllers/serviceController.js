const Service = require('../models/Service');

exports.getServices = async (req, res) => {
  try {
    const { category, search, trending, featured, page = 1, limit = 10 } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { nameBn: { $regex: search, $options: 'i' } }
    ];
    if (trending === 'true') query.isTrending = true;
    if (featured === 'true') query.isFeatured = true;

    const skip = (page - 1) * limit;
    const [services, total] = await Promise.all([
      Service.find(query).sort('order').skip(skip).limit(parseInt(limit)),
      Service.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: services.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: services
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch services' });
  }
};

exports.getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch service' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Service.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const names = {
      government: 'Government Services',
      financial: 'Financial Services',
      travel: 'Travel Services',
      utility: 'Utility Services',
      professional: 'Professional Services',
      other: 'Other Services'
    };

    const formatted = categories.map(cat => ({
      id: cat._id,
      name: names[cat._id] || cat._id,
      count: cat.count
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};
