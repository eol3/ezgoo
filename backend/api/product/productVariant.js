const router = require("express-promise-router")({ mergeParams: true })
const wrapValidator = require(process.cwd() + '/tools/validator')
const Product = require(process.cwd() + '/models/product/product')
const productVariant = require(process.cwd() + '/models/product/productVariant')
const { authStore }= require(process.cwd() + '/tools/libs')

module.exports = router

router.get('/:productVarintId', async function(req, res, next) {
  
  const useData = {
    id: req.params.productVarintId,
    storeId: req.query.storeId,
    productId: req.params.productId,
  }
  
  const validator = wrapValidator(useData, {
    id: 'required|numeric|min:1',
    storeId: 'required|numeric|min:1',
    productId: 'required|numeric|min:1',
  }, 'product');
  
  if (validator.fail) {
    next({statusCode: 400, ...validator.errors}); return;
  }

  if (!await authStore(req, next, {
    storeId: useData.storeId,
    status: useData.status,
    role: ['owner', 'editor']
  })) return
  
  if (useData.status === 'all') delete useData.status
	
	let result = await productVariant.getOne(useData)
	if (!result) return next({statusCode: 404 })
  result.productOption = JSON.parse(result.productOption)
	res.json(result)
})

router.get('/', async function(req, res, next) {
  
  const useData = {
		storeId: req.query.storeId,
		productId: req.params.productId,
    status: req.query.status,
    sortBy: req.query.sortBy,
	  orderBy: req.query.orderBy,
	}
	
	const validator = wrapValidator(useData, {
		storeId: 'required|numeric|min:1',
		productId: 'required|numeric|min:1',
    status: 'enum:statusQuery', // 跟隨product.status, all:查詢全部, 0:未公開, 1:已公開
    sortBy: 'string|enum:sortBy',
	  orderBy: 'string|enum:orderBy',
  }, 'product')
  
  if (validator.fail) {
  	return next({statusCode: 400, ...validator.errors})
  }

  if (!await authStore(req, next, {
    storeId: useData.storeId,
    status: useData.status,
    role: ['owner', 'editor']
  })) return
  
  if (useData.status === 'all') delete useData.status
  delete useData.storeId
	
	let result = await productVariant.getList(useData)
	
  result.forEach(e => e.productOption = JSON.parse(e.productOption))

	res.json(result)
})

router.post('/', async function(req, res, next) {
	
  const useData = {
    storeId: req.query.storeId,
    productId: req.params.productId,
    productOption: req.body.productOption,
    price: req.body.price,
    number: req.body.number,
		createBy: req.session.user.id,
		updateBy: req.session.user.id,
  }
  
  const validator = wrapValidator(useData, {
    storeId: 'required|numeric|min:1',
    productId: 'required|numeric|min:1',
    price: 'numeric',
    number: 'numeric',
  }, 'product');
  
  if (validator.fail) {
    next({statusCode: 400, ...validator.errors}); return;
  }
  
  if (!await authStore(req, next, {
    storeId: useData.storeId,
    role: ['owner', 'editor']
  })) return

  result = await productVariant.create(useData)
  
  Product.plusOne({ id: useData.productId }, { variantCount: 1})
  // console.log(result)
  res.status(200).json({ id: result[0] });
})

router.put('/:productVarintId', async function(req, res, next) {
  const useData = {
    id: req.params.productVarintId,
    storeId: req.query.storeId,
    productId: req.params.productId,
    productOption: req.body.productOption,
    price: req.body.price,
    number: req.body.number,
		createBy: req.session.user.id,
		updateBy: req.session.user.id,
  }
  
  const validator = wrapValidator(useData, {
    id: 'required|numeric|min:1',
    storeId: 'required|numeric|min:1',
    productId: 'required|numeric|min:1',
    price: 'numeric',
    number: 'numeric',
  }, 'product');
  
  if (validator.fail) {
    next({statusCode: 400, ...validator.errors}); return;
  }
  
  if (!await authStore(req, next, {
    storeId: useData.storeId,
    role: ['owner', 'editor']
  })) return

  result = await productVariant.update({ id: useData.id }, useData)

  // console.log(result)
  res.status(200).json();
})

router.delete('/:productVarintId', async function(req, res, next) {
  const useData = {
		id: req.params.productVarintId,
    storeId: req.query.storeId,
    productId: req.params.productId,
  }

  const validator = wrapValidator(useData, {
		id: 'required|numeric|min:1',
    storeId: 'required|numeric|min:1',
    productId: 'required|numeric|min:1',
  }, 'product');
  
  if (validator.fail) {
    next({statusCode: 400, ...validator.errors}); return;
  }
  
  if (!await authStore(req, next, {
    storeId: useData.storeId,
    role: ['owner', 'editor']
  })) return

  let currentVariant = await productVariant.getOne({ id: useData.id })
  if (!currentVariant) {
    return next({statusCode: 404 })
  }
  
  result = await productVariant.delete({ id: useData.id })
  
  Product.plusOne({ id: req.params.productId }, { variantCount: -1})
  
  if (currentVariant) {
    // 刪除相應圖片
    const ProductImage = require(process.cwd() + '/models/product/productImage')
    const images = await ProductImage.getList({
      storeId: useData.storeId,
      productId: useData.productId,
      productOption: currentVariant.productOption
    })
    if (images.length !== 0) {
      for(const img of images) {
        await ProductImage.delete({ id: img.id })
        const fs = require('fs');
        let dir = './public/uploads/product-images/' + img.id
        fs.rm(dir, { recursive: true, force: true }, () => {})
      }
    }
  }
  
  res.status(200).json();
})