const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
  try {
    const { serviceId, customService, workDescription, customerDetails } = req.body;
    
    const orderData = {
      user: req.user.id,
      workDescription,
      customerDetails,
      status: 'pending'
    };

    if (serviceId) orderData.service = serviceId;
    if (customService) orderData.customService = customService;

    const order = await Order.create(orderData);
    await order.populate('service', 'name price');

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { user: req.user.id };
    if (status && status !== 'all') query.status = status;

    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find(query).populate('service', 'name price').sort('-createdAt').skip(skip).limit(parseInt(limit)),
      Order.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      totalPages: Math.ceil(total / limit),
      data: orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('service', 'name price');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
};
