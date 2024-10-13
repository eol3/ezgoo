const router = require("express-promise-router")({ mergeParams: true })
const wrapValidator = require(process.cwd() + '/tools/validator')
const ProductCategoriesOnProducts = require(process.cwd() + '/models/product/productCategoriesOnProducts')
const { authStore }= require(process.cwd() + '/tools/libs')

module.exports = router

router.get('/', async function(req, res, next) {

  const useData = {
    productId: req.params.productId,
		productCategoryId: req.query.productCategoryId,
    sortBy: req.query.sortBy,
	  orderBy: req.query.orderBy,
	}
	
	const validator = wrapValidator(useData, {
		productId: 'required|numeric|min:1',
    productCategoryId: 'numeric|min:1',
    sortBy: 'string|enum:sortBy',
	  orderBy: 'string|enum:orderBy',
  }, 'product')
  
  if (validator.fail) {
  	return next({statusCode: 400, ...validator.errors})
  }

  // auth

  let result = await ProductCategoriesOnProducts.getList(useData)

  res.status(200).json(result)
})

router.post('/', async function(req, res, next) {

  const useData = {
    storeId: req.query.storeId,
    productId: req.params.productId,
    productCategoryIds: req.body.productCategoryIds,
    createBy: req.session.user.id,
	}
	
	const validator = wrapValidator(useData, {
    storeId: 'required|numeric|min:1',
		productId: 'required|numeric|min:1',
    productCategoryIds: 'required|idStringArray',
  }, 'product')
  
  if (validator.fail) {
  	return next({statusCode: 400, ...validator.errors})
  }

  if (!await authStore(req, next, {
    storeId: useData.storeId,
    role: ['owner', 'editor']
  })) return

  let multi = []
  for (const id of useData.productCategoryIds) {
    multi.push({
      productId: useData.productId,
      productCategoryId: id,
      createBy: useData.createBy,
    })
  }
  await ProductCategoriesOnProducts.create(multi)
  
  updateNumber(useData.productCategoryIds)

  res.status(200).json();
})

router.put('/update-number', async function(req, res, next) {

  const useData = {
    storeId: req.query.storeId,
    productCategoryIds: req.body.productCategoryIds
	}
	
	const validator = wrapValidator(useData, {
    storeId: 'required|numeric|min:1',
    productCategoryIds: 'required|idStringArray',
  }, 'product')
  
  if (validator.fail) {
  	return next({statusCode: 400, ...validator.errors})
  }

  if (!await authStore(req, next, {
    storeId: useData.storeId,
    role: ['owner', 'editor']
  })) return
  
  updateNumber(useData.productCategoryIds)

  res.status(200).json();
})

router.delete('/', async function(req, res, next) {

  const useData = {
    storeId: req.query.storeId,
    productId: req.params.productId,
    productCategoryIds: req.query.productCategoryIds,
	}
	
	const validator = wrapValidator(useData, {
    storeId: 'required|numeric|min:1',
    productId: 'required|numeric|min:1',
    productCategoryIds: 'required|idStringArray',
  }, 'product')
  
  if (validator.fail) {
  	return next({statusCode: 400, ...validator.errors})
  }

  if (!await authStore(req, next, {
    storeId: useData.storeId,
    role: ['owner', 'editor']
  })) return

  await ProductCategoriesOnProducts.delete(useData)
  
  updateNumber(useData.productCategoryIds)

  res.status(200).json();
})

async function updateNumber(ids) {
  const productCategory = require(process.cwd() + '/models/product/productCategory')
  for (const id of ids) {
    let result = await ProductCategoriesOnProducts.getCount({
      productStatus: 1,
      productCategoryId: id
    })
    await productCategory.update({ id: id }, { number: result.total })
  }
}