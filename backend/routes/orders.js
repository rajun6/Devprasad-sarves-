const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createOrder, getMyOrders, getOrder } = require('../controllers/orderController');
const multer = require('multer');
const path = require('path');

// Simple multer setup for orders
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

router.use(protect);
router.post('/', upload.array('documents', 5), createOrder);
router.get('/myorders', getMyOrders);
router.get('/:id', getOrder);

module.exports = router;
