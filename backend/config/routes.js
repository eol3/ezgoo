const express = require('express');
const router = new express.Router();

router.use('/api/product', require('../api/product'))
router.use('/api/user', require('../api/user'))

module.exports = router;
