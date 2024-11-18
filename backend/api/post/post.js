const router = require("express-promise-router")({ mergeParams: true })
const wrapValidator = require(process.cwd() + '/tools/validator')
const Post = require(process.cwd() + '/models/post/post')
const { authStore }= require(process.cwd() + '/tools/libs')

module.exports = router

router.get('/count', async function(req, res, next) {
	
	const useData = {
		storeId: req.query.storeId,
		status: req.query.status,
		word: req.query.word,
    categoris: req.query.categoris,
	}
	
	const validator = wrapValidator(useData, {
		storeId: 'numeric|min:1',
		status: 'enum:statusQuery', // all:查詢全部, 0:未公開, 1:已公開
		word: 'string',
    categoris: 'idStringArray',
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
	
	let result = await Post.getCount(useData)
	
	res.json(result)
})

router.get('/', async function(req, res, next) {
	
	const useData = {
		storeId: req.query.storeId,
		status: req.query.status,
		word: req.query.word,
    categoris: req.query.categoris,
		sortBy: req.query.sortBy,
	  orderBy: req.query.orderBy,
		limit: req.query.limit || 10,
		offset: req.query.offset || 0
	}
	
	const validator = wrapValidator(useData, {
		storeId: 'required|numeric|min:1',
		status: 'enum:statusQuery', // all:查詢全部, 0:未公開, 1:已公開
		word: 'string',
    categoris: 'idStringArray',
	  sortBy: 'string|enum:sortBy',
	  orderBy: 'string|enum:orderBy',
	  limit: 'numeric|min:0',
	  offset: 'numeric|min:0'
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
	
  // Post.setRoleFilter(req.session.user)
	let result = await Post.getList(useData)

  for(const item of result) {
    if (item.thumbnail) {
      item.thumbnail = process.env.BASE_URL + item.thumbnail
    }
  }
	
	res.json(result)
})

router.get('/:postId', async function(req, res, next) {
	
	const useData = {
		id: req.params.postId,
    storeId: req.query.storeId,
    status: req.query.status,
	}
	
	const validator = wrapValidator(useData, {
	  id: 'required|numeric|min:1',
    storeId: 'numeric|min:1',
    status: 'enum:statusQuery', // all:查詢全部, 0:未公開, 1:已公開
  }, 'post')
  
  if (validator.fail) {
  	return next({statusCode: 404 })
  }

  if (useData.status === 'all') delete useData.status
	
  // Post.setRoleFilter(req.session.user)
	let result = await Post.getOne(useData)

  if (!result) {
	  return next({statusCode: 404 })
	}

  if (!await authStore(req, next, {
    storeId: result.storeId,
    status: useData.status,
    role: ['owner', 'editor']
  })) return
	
	res.json(result)
})

router.post('/', async function(req, res, next) {
	
	const useData = {
    storeId: req.query.storeId,
    content: req.body.content,
    status: req.body.status, // 0:未公開, 1:已公開
		createBy: req.session.user.id,
		updateBy: req.session.user.id,
  }
  
  const validator = wrapValidator(useData, {
    storeId: 'required|numeric|min:1',
    content: 'string',
    status: 'enum:status',
  }, 'post');
  
  if (validator.fail) {
    next({statusCode: 400, ...validator.errors}); return;
  }
  
  if (!await authStore(req, next, {
    storeId: useData.storeId,
    role: ['owner', 'editor']
  })) return

  if (useData.status === 1) {
    useData.publishedAt = new Date().toISOString().replace('Z','').replace('T', ' ')
  }

  result = await Post.create(useData)
  // console.log(result)
  res.status(200).json({ id: result[0] });
})

router.put('/:postId', async function(req, res, next) {
	
	const useData = {
		id: req.params.postId,
    storeId: req.query.storeId,
    content: req.body.content,
    thumbnail: req.body.thumbnail,
    status: req.body.status, // 0:未公開, 1:已公開
		updateBy: req.session.user.id,
  }
  
  const validator = wrapValidator(useData, {
		id: 'required|numeric|min:1',
    storeId: 'required|numeric|min:1',
    content: 'string',
    thumbnail: 'string',
    status: 'enum:status',
  }, 'post');
  
  if (validator.fail) {
    next({statusCode: 400, ...validator.errors}); return;
  }
  
  if (!await authStore(req, next, {
    storeId: useData.storeId,
    role: ['owner', 'editor']
  })) return

  let result = await Post.getOne({ id: useData.id })
  if (result.status === 0 && useData.status === 1) {
    useData.publishedAt = new Date().toISOString().replace('Z','').replace('T', ' ')
  }
  
  result = await Post.update({ id: useData.id }, useData)
  
  res.status(200).json();
})

router.delete('/:postId', async function(req, res, next) {
  const useData = {
		id: req.params.postId,
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
  
  result = await Post.delete({ id: useData.id })
  // 刪除相關圖片，刪除分類關係，刪除variant
  
  res.status(200).json();

})
