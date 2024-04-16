const router = require("express-promise-router")({ mergeParams: true })
const wrapValidator = require(process.cwd() + '/tools/validator')
const ProductVariant = require(process.cwd() + '/models/product/productVariant')
const Product = require(process.cwd() + '/models/product/product')
const { authUserStoreRole }= require(process.cwd() + '/tools/libs')

module.exports = router

router.get('/', async function(req, res, next) {

})