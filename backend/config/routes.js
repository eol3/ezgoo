const express = require('express');
const router = new express.Router();

router.use('/api/product-category/:productCategoryId/product', require('../api/product/categorisOnProducts'))
router.use('/api/product/:productId/product-category', require('../api/product/productsOnCategoris'))
router.use('/api/product-category', require('../api/product/productCategory'))

router.use('/api/product', require('../api/product/product'))
router.use('/api/product/:productId/images', require('../api/product/productImage'))
router.use('/api/product/:productId/variant', require('../api/product/productVariant'))


router.use('/api/post/:postId/post-category', require('../api/post/postCategoriesOnPosts'))
router.use('/api/post-category', require('../api/post/postCategory'))
router.use('/api/post', require('../api/post/post'))
router.use('/api/post/:postId/images', require('../api/post/postImage'))

router.use('/api/store', require('../api/store/store'))
router.use('/api/store/:storeId/images', require('../api/store/storeImage'))

router.use('/api/user', require('../api/user/user'))
router.use('/api/user/store', require('../api/user/userStore'))
router.use('/api/user/cart', require('../api/user/userCart'))

router.use('/api/order', require('../api/order/order'))
router.use('/api/order/:orderId/Log', require('../api/order/orderLog'))

module.exports = router;
