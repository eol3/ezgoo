const express = require('express');
const router = new express.Router();

router.use('/api/product', require('../api/product'))
router.use('/api/user', require('../api/user/user'))
router.use('/api/user/store', require('../api/user/store'))
router.use('/api/store', require('../api/store'))

module.exports = router;
