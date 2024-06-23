const router = require("express-promise-router")({ mergeParams: true })
const wrapValidator = require(process.cwd() + '/tools/validator')
const postCategory = require(process.cwd() + '/models/post/postCategory')
const { authStore }= require(process.cwd() + '/tools/libs')

module.exports = router

router.get('/', async function(req, res, next) {
  const useData = {
		storeId: req.query.storeId,
    status: req.query.status || '1',
    sortBy: req.query.sortBy,
	  orderBy: req.query.orderBy,
	}
	
	const validator = wrapValidator(useData, {
		storeId: 'required|numeric|min:1',
    status: 'enum:statusQuery', // 跟隨store.status, all:查詢全部, 0:未公開, 1:已公開
    sortBy: 'string|enum:sortBy',
	  orderBy: 'string|enum:orderBy',
  }, 'post')
  
  if (validator.fail) {
  	return next({statusCode: 400, ...validator.errors})
  }
  
  if (!await authStore(req, next, {
    storeId: useData.storeId,
    status: useData.status,
    role: ['owner', 'editor']
  })) return
  
  if (useData.status === 'all') delete useData.status
	
	let result = await postCategory.getList(useData)
	
	res.json(result)
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
  }, 'post');
  
  if (validator.fail) {
    next({statusCode: 400, ...validator.errors}); return;
  }
  
  if (!await authStore(req, next, {
    storeId: useData.storeId,
    role: ['owner', 'editor']
  })) return

  result = await postCategory.create(useData)

  await postCategory.update({ id: result[0] }, { priority: result[0] })
  // console.log(result)
  res.status(200).json({ id: result[0] });
})

router.put('/:postCategoryId', async function(req, res, next) {
	
	const useData = {
    id: req.params.postCategoryId,
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
  }, 'post');
  
  if (validator.fail) {
    next({statusCode: 400, ...validator.errors}); return;
  }
  
  if (!await authStore(req, next, {
    storeId: useData.storeId,
    role: ['owner', 'editor']
  })) return
  
  result = await postCategory.update({ id: useData.id }, useData)
  
  res.status(200).json();
})

router.delete('/:postCategoryId', async function(req, res, next) {
  const useData = {
		id: req.params.postCategoryId,
    storeId: req.query.storeId,
  }

  const validator = wrapValidator(useData, {
		id: 'required|numeric|min:1',
    storeId: 'required|numeric|min:1',
  }, 'post');
  
  if (validator.fail) {
    next({statusCode: 400, ...validator.errors}); return;
  }
  
  if (!await authStore(req, next, {
    storeId: useData.storeId,
    role: ['owner', 'editor']
  })) return

  let currentCategory = await postCategory.getOne({ id: useData.id })
  await postCategory.update({ parentId: useData.id }, { parentId: currentCategory.parentId })
  
  result = await postCategory.delete({ id: useData.id })
  // 刪除ProductCategoriesOnProducts
  const ProductCategoriesOnProducts = require(process.cwd() + '/models/product/productCategoriesOnProducts')
  ProductCategoriesOnProducts.delete({
    postCategoryId: currentCategory.id
  })
  
  res.status(200).json();

})