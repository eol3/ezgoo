const express = require('express');
const router = new express.Router();

router.use('/api/product', require('../api/product'))

module.exports = router;
