const router = require("express-promise-router")({ mergeParams: true })
const wrapValidator = require(process.cwd() + '/tools/validator')
const Product = require(process.cwd() + '/models/product')

module.exports = router

router.get('/', async function(req, res, next) {
	
	let result = await Product.getOne({ id: 1 })
	
	res.json(result)
  // if (req.session.admin) {
  //   res.json(true)
  // } else {
  //   res.json(false)
  // }
})