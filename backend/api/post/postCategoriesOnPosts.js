const router = require("express-promise-router")({ mergeParams: true })
const wrapValidator = require(process.cwd() + '/tools/validator')
const postCategoriesOnPosts = require(process.cwd() + '/models/post/postCategoriesOnPosts')
const { authStore }= require(process.cwd() + '/tools/libs')

module.exports = router

router.get('/', async function(req, res, next) {

  const useData = {
    postId: req.params.postId,
		postCategoryId: req.query.postCategoryId,
    sortBy: req.query.sortBy,
	  orderBy: req.query.orderBy,
	}
	
	const validator = wrapValidator(useData, {
		postId: 'required|numeric|min:1',
    postCategoryId: 'numeric|min:1',
    sortBy: 'string|enum:sortBy',
	  orderBy: 'string|enum:orderBy',
  }, 'post')
  
  if (validator.fail) {
  	return next({statusCode: 400, ...validator.errors})
  }

  let result = await postCategoriesOnPosts.getList(useData)

  res.status(200).json(result)
})

router.post('/', async function(req, res, next) {

  const useData = {
    storeId: req.query.storeId,
    postId: req.params.postId,
    postCategoryIds: req.body.postCategoryIds,
    createBy: req.session.user.id,
	}
	
	const validator = wrapValidator(useData, {
    storeId: 'required|numeric|min:1',
		postId: 'required|numeric|min:1',
    postCategoryIds: 'required|idStringArray',
  }, 'post')
  
  if (validator.fail) {
  	return next({statusCode: 400, ...validator.errors})
  }

  if (!await authStore(req, next, {
    storeId: useData.storeId,
    role: ['owner', 'editor']
  })) return

  let multi = []
  for (const id of useData.postCategoryIds) {
    multi.push({
      postId: useData.postId,
      postCategoryId: id,
      createBy: useData.createBy,
    })
  }
  await postCategoriesOnPosts.create(multi)
  // console.log(result)
  res.status(200).json();
})

router.delete('/', async function(req, res, next) {

  const useData = {
    storeId: req.query.storeId,
    postId: req.params.postId,
    postCategoryIds: req.query.postCategoryIds,
	}
	
	const validator = wrapValidator(useData, {
    storeId: 'required|numeric|min:1',
    postId: 'required|numeric|min:1',
    postCategoryIds: 'required|idStringArray',
  }, 'post')
  
  if (validator.fail) {
  	return next({statusCode: 400, ...validator.errors})
  }

  if (!await authStore(req, next, {
    storeId: useData.storeId,
    role: ['owner', 'editor']
  })) return

  await postCategoriesOnPosts.delete(useData)
  // console.log(result)
  res.status(200).json();
})