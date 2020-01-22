const express = require('express');
const router = new express.Router();

router.use('/api/user', require('../api/user'))
router.use('/api/store', require('../api/store'))
router.use('/api/product', require('../api/product'))
router.use('/api/class', require('../api/class'))
router.use('/api/post', require('../api/post'))
router.use('/api/order', require('../api/order'))
router.use('/api/like', require('../api/like'))
router.use('/api/bookmark', require('../api/bookmark'))
router.use('/api/history', require('../api/history'))
router.use('/api/spec', require('../api/specification'))
router.use('/api/promotions', require('../api/promotions'))
router.use('/api/permissions', require('../api/permissions'))

module.exports = router;
