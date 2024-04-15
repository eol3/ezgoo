const router = require("express-promise-router")({ mergeParams: true })
const wrapValidator = require(process.cwd() + '/tools/validator')
const productOptions = require(process.cwd() + '/models/product/productOptions')
const { authUserStoreRole, authUserStoreRoleGroup }= require(process.cwd() + '/tools/libs')

module.exports = router

router.get('/', async function(req, res, next) {
  
})