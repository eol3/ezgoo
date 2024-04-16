const express = require('express');
const router = new express.Router();

router.use('/api/product-category/:productCategoryId/product', require('../api/product/categorisOnProducts'))
router.use('/api/product/:productId/product-category', require('../api/product/productsOnCategoris'))
router.use('/api/product-category', require('../api/product/productCategory'))


router.use('/api/product-options', require('../api/product/productOptions'))


router.use('/api/product', require('../api/product/product'))
// router.use('/api/product/images', require('../api/product/newProductImages'))
router.use('/api/product/:productId/images', require('../api/product/images'))
router.use('/api/product/:productId/variant', require('../api/product/variant'))


router.use('/api/user', require('../api/user/user'))
router.use('/api/user/store', require('../api/user/store'))
router.use('/api/store', require('../api/store'))

module.exports = router;
