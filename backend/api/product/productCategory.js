const router = require("express-promise-router")({ mergeParams: true })
const wrapValidator = require(process.cwd() + '/tools/validator')
const productCategory = require(process.cwd() + '/models/product/productCategory')
const { authStore }= require(process.cwd() + '/tools/libs')

module.exports = router

router.get('/', async function(req, res, next) {
	
	const useData = {
		storeId: req.query.storeId,
    status: req.query.status,
    sortBy: req.query.sortBy,
	  orderBy: req.query.orderBy,
	}
	
	const validator = wrapValidator(useData, {
		storeId: 'required|numeric|min:1',
    status: 'enum:statusQuery', // 跟隨store.status, all:查詢全部, 0:未公開, 1:已公開
    sortBy: 'string|enum:sortBy',
	  orderBy: 'string|enum:orderBy',
  }, 'product')
  
  if (validator.fail) {
  	return next({statusCode: 400, ...validator.errors})
  }
  
  if (!await authStore(req, next, {
    storeId: useData.storeId,
    status: useData.status,
    group: ['manage']
  })) return
  
  if (useData.status === 'all') delete useData.status
	
	let result = await productCategory.getList(useData)
	
	res.json(result)
})

router.get('/:productCategoryId', async function(req, res, next) {
})

router.post('/', async function(req, res, next) {
	
	const useData = {
    storeId: req.query.storeId,
    parentId: req.body.parentId,
    name: req.body.name,
    children: req.body.children,
    priority: req.body.priority,
		createBy: req.session.user.id,
		updateBy: req.session.user.id,
  }
  
  const validator = wrapValidator(useData, {
    storeId: 'required|numeric|min:1',
    parentId: 'numeric|min:1',
    name: 'string',
    children: 'numeric',
    priority: 'numeric'
  }, 'product');
  
  if (validator.fail) {
    next({statusCode: 400, ...validator.errors}); return;
  }
  
  if (!await authStore(req, next, {
    storeId: useData.storeId,
    role: ['owner', 'editor']
  })) return

  result = await productCategory.create(useData)

  await productCategory.update({ id: result[0] }, { priority: result[0] })
  // console.log(result)
  res.status(200).json({ id: result[0] });
})

router.put('/:productCategoryId', async function(req, res, next) {
	
	const useData = {
    id: req.params.productCategoryId,
    storeId: req.query.storeId,
    parentId: req.body.parentId,
    name: req.body.name,
    children: req.body.children,
    priority: req.body.priority,
		createBy: req.session.user.id,
		updateBy: req.session.user.id,
  }
  
  const validator = wrapValidator(useData, {
    id: 'required|numeric|min:1',
    storeId: 'required|numeric|min:1',
    parentId: 'numeric|min:1',
    name: 'string',
    children: 'numeric',
    priority: 'numeric'
  }, 'product');
  
  if (validator.fail) {
    next({statusCode: 400, ...validator.errors}); return;
  }
  
  if (!await authStore(req, next, {
    storeId: useData.storeId,
    role: ['owner', 'editor']
  })) return
  
  result = await productCategory.update({ id: useData.id }, useData)
  
  res.status(200).json();
})

router.delete('/:productCategoryId', async function(req, res, next) {
  const useData = {
		id: req.params.productCategoryId,
    storeId: req.query.storeId,
  }

  const validator = wrapValidator(useData, {
		id: 'required|numeric|min:1',
    storeId: 'required|numeric|min:1',
  }, 'product');
  
  if (validator.fail) {
    next({statusCode: 400, ...validator.errors}); return;
  }
  
  if (!await authStore(req, next, {
    storeId: useData.storeId,
    role: ['owner', 'editor']
  })) return

  let currentCategory = await productCategory.getOne({ id: useData.id })
  await productCategory.update({ parentId: useData.id }, { parentId: currentCategory.parentId })
  
  result = await productCategory.delete({ id: useData.id })
  // 刪除ProductCategoriesOnProducts
  const ProductCategoriesOnProducts = require(process.cwd() + '/models/product/productCategoriesOnProducts')
  ProductCategoriesOnProducts.delete({
    productCategoryId: currentCategory.id
  })
  
  res.status(200).json();

})