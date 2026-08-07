const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const adminController = require('../controllers/adminController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// ============ PUBLIC ROUTES (No Auth) ============
// Settings GET - client site needs this
router.get('/settings', function(req, res, next) {
    // Skip auth for GET /settings
    adminController.getSettings(req, res);
});

// ============ PROTECTED ROUTES ============
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, authorize('admin'), adminController.getDashboardStats);
router.post('/services', protect, authorize('admin'), upload.single('serviceImage'), adminController.createService);
router.put('/services/:id', protect, authorize('admin'), upload.single('serviceImage'), adminController.updateService);
router.delete('/services/:id', protect, authorize('admin'), adminController.deleteService);
router.get('/orders', protect, authorize('admin'), adminController.getAllOrders);
router.put('/orders/:id/status', protect, authorize('admin'), adminController.updateOrderStatus);
router.delete('/orders/:id', protect, authorize('admin'), adminController.deleteOrder);
router.get('/users', protect, authorize('admin'), adminController.getAllUsers);
router.put('/users/:id/status', protect, authorize('admin'), adminController.updateUserStatus);
router.delete('/users/:id', protect, authorize('admin'), adminController.deleteUser);
router.put('/settings', protect, authorize('admin'), upload.fields([{ name: 'ownerPhoto', maxCount: 1 }, { name: 'logo', maxCount: 1 }]), adminController.updateSettings);

module.exports = router;
