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

// ALL ROUTES PUBLIC - NO AUTH
router.get('/settings', adminController.getSettings);
router.get('/dashboard', adminController.getDashboardStats);
router.post('/services', upload.single('serviceImage'), adminController.createService);
router.put('/services/:id', upload.single('serviceImage'), adminController.updateService);
router.delete('/services/:id', adminController.deleteService);
router.get('/orders', adminController.getAllOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);
router.delete('/orders/:id', adminController.deleteOrder);
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/status', adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);
router.put('/settings', upload.fields([{ name: 'ownerPhoto', maxCount: 1 }, { name: 'logo', maxCount: 1 }]), adminController.updateSettings);

module.exports = router;
