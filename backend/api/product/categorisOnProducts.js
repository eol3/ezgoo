const router = require("express-promise-router")({ mergeParams: true })
const wrapValidator = require(process.cwd() + '/tools/validator')
const productCategory = require(process.cwd() + '/models/product/productCategory')
const { authUserStoreRole, authUserStoreRoleGroup }= require(process.cwd() + '/tools/libs')

module.exports = router

router.get('/', async function(req, res, next) {
  res.status(200).json()
})