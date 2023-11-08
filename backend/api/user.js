const router = require("express-promise-router")({ mergeParams: true })

module.exports = router

router.get('/', async function(req, res, next) {
	res.json({ status: 1 })
})