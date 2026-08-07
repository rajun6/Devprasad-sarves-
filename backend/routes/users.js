const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.use(protect);

module.exports = router;
