const router = require("express-promise-router")({ mergeParams: true })
const wrapValidator = require(process.cwd() + '/tools/validator')
const ProductImage = require(process.cwd() + '/models/product/productImage')
const multer  = require('multer')
const upload = multer({ dest: 'tmp' })
const { authUserStoreRole }= require(process.cwd() + '/tools/libs')

module.exports = router

router.post('/', upload.any('files'), async function (req, res, next) {
  
  const useData = {
		storeId: req.body.storeId,
    createBy: req.session.user.id,
		updateBy: req.session.user.id,
	}

  const validator = wrapValidator(useData, {
		storeId: 'required|numeric|min:1',
  }, 'product')

  if (validator.fail) {
  	return next({statusCode: 400, ...validator.errors})
  }

  if (!await authUserStoreRole(req, useData.storeId, ['owner', 'editor'])) {
  	return next({statusCode: 403 })
  }

  delete useData.storeId
  // console.log(req.files)
  let imagesIds = []
  for (const file of req.files) {
    // todo: 移動檔案
    useData.filename = file.filename
    useData.size = file.size
    const result = await ProductImage.create(useData)
    imagesIds.push(result[0])
  }
  
  res.status(200).json(imagesIds);
});