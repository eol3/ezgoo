const router = require("express-promise-router")({ mergeParams: true })
const wrapValidator = require(process.cwd() + '/tools/validator')
const Product = require(process.cwd() + '/models/product/product')
const productCategory = require(process.cwd() + '/models/product/productCategory')
const ProductCategoriesOnProducts = require(process.cwd() + '/models/product/productCategoriesOnProducts')
const productVariant = require(process.cwd() + '/models/product/productVariant')
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
		storeId: 'required|numeric|min:1',
		status: 'enum:statusQuery', // all:查詢全部, 0:未公開, 1:已公開
		word: 'string',
    categoris: 'idStringArray',
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
	
	let result = await Product.getCount(useData)
	
	res.json(result)
})

router.get('/:productId', async function(req, res, next) {
	
	const useData = {
		id: req.params.productId,
    storeId: req.query.storeId,
    status: req.query.status,
    withImage: req.query.withImage,
    withVariant: req.query.withVariant,
	}
	
	const validator = wrapValidator(useData, {
	  id: 'required|numeric|min:1',
    storeId: 'numeric|min:1', // 允許非必要，前台商品網址希望短一點不包含商店
    status: 'enum:statusQuery', // all:查詢全部, 0:未公開, 1:已公開
    withImage: 'boolean',
    withVariant: 'boolean',
  }, 'product')
  
  if (validator.fail) {
  	return next({statusCode: 404 })
  }

  if (useData.status === 'all') delete useData.status

  // Product.setRoleFilter(req.session.user)
	let result = await Product.getOne(useData)
	
	if (!result) {
	  return next({statusCode: 404 })
	}

  if (!await authStore(req, next, {
    storeId: result.storeId,
    status: useData.status,
    role: ['owner', 'editor']
  })) return

  if (result.thumbnail) {
    result.thumbnail = process.env.BASE_URL + result.thumbnail
  }
  result.options = JSON.parse(result.options)

  if (useData.withImage) {
    const ProductImage = require(process.cwd() + '/models/product/productImage')
    let image = await ProductImage.getList({
      productId: useData.id,
      sortBy: 'priority',
      orderBy: 'ASC',
    })
    for(const key in image) {
      image[key].baseUrl = process.env.BASE_URL
      image[key].options = JSON.parse(image[key].options)
      image[key].productOption = JSON.parse(image[key].productOption)
    }
    result.image = image
  }

  if (useData.withVariant) {
    let variant = await productVariant.getList({
      productId: useData.id
    })
    variant.forEach(e => e.productOption = JSON.parse(e.productOption))
    result.variant = variant
  }

  res.json(result)
})

router.get('/', async function(req, res, next) {
	
	const useData = {
    ids: req.query.ids,
		storeId: req.query.storeId,
		status: req.query.status,
    categoris: req.query.categoris,
		word: req.query.word,
		sortBy: req.query.sortBy,
	  orderBy: req.query.orderBy,
		limit: req.query.limit || 10,
		offset: req.query.offset || 0
	}
	
	const validator = wrapValidator(useData, {
    ids: 'idStringArray',
		storeId: 'required|numeric|min:1',
		status: 'enum:statusQuery', // all:查詢全部, 0:未公開, 1:已公開
    categoris: 'idStringArray',
	  word: 'string',
	  sortBy: 'string|enum:sortBy',
	  orderBy: 'string|enum:orderBy',
	  limit: 'numeric|min:0',
	  offset: 'numeric|min:0'
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
	
  // Product.setRoleFilter(req.session.user)
	let result = await Product.getList(useData)

  for(const item of result) {
    if (item.thumbnail) {
      item.thumbnail = process.env.BASE_URL + item.thumbnail
    }
    item.options = JSON.parse(item.options)
  }
	
	res.json(result)
})

router.post('/', async function(req, res, next) {
	
	const useData = {
    storeId: req.query.storeId,
    name: req.body.name,
    price: req.body.price, // -1:未標示售價, -2:僅展示
    number: req.body.number,
    barcode: req.body.barcode,
    describe: req.body.describe,
    status: req.body.status, // 0:未公開, 1:已公開
		createBy: req.session.user.id,
		updateBy: req.session.user.id,
  }
  
  const validator = wrapValidator(useData, {
    storeId: 'required|numeric|min:1',
    name: 'string',
    price: 'numeric',
    number: 'numeric',
    barcode: 'string',
    describe: 'string',
    status: 'enum:status',
  }, 'product');
  
  if (validator.fail) {
    next({statusCode: 400, ...validator.errors}); return;
  }
  
  if (!await authStore(req, next, {
    storeId: useData.storeId,
    role: ['owner', 'editor']
  })) return

  useData.options = []

  if (useData.status === 1) {
    useData.publishedAt = new Date().toISOString().replace('Z','').replace('T', ' ')
  }

  result = await Product.create(useData)
  // console.log(result)
  // updateCategoryNumber(useData.id)

  res.status(200).json({ id: result[0] });
})

router.put('/:productId', async function(req, res, next) {
	
	const useData = {
		id: req.params.productId,
    storeId: req.query.storeId,
    name: req.body.name,
    price: req.body.price, // -1:未標示售價, -2:僅展示
    number: req.body.number,
    barcode: req.body.barcode,
    options: req.body.options,
    describe: req.body.describe,
    thumbnail: req.body.thumbnail,
    status: req.body.status, // 0:未公開, 1:已公開
		updateBy: req.session.user.id,
  }
  
  const validator = wrapValidator(useData, {
		id: 'required|numeric|min:1',
    storeId: 'required|numeric|min:1',
    name: 'string',
    price: 'numeric',
    number: 'numeric',
    barcode: 'string',
    describe: 'string',
    thumbnail: 'string',
    status: 'enum:status',
  }, 'product');
  
  if (validator.fail) {
    next({statusCode: 400, ...validator.errors}); return;
  }
  
  if (!await authStore(req, next, {
    storeId: useData.storeId,
    role: ['owner', 'editor']
  })) return

  let result = await Product.getOne({ id: useData.id })
  if (result.status === 0 && useData.status === 1) {
    useData.publishedAt = new Date().toISOString().replace('Z','').replace('T', ' ')
  }
  
  result = await Product.update({ id: useData.id }, useData)
  
  // updateCategoryNumber(useData.id)

  res.status(200).json();
})

router.delete('/:productId', async function(req, res, next) {
  const useData = {
		id: req.params.productId,
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
  
  result = await Product.delete({ id: useData.id })
  // 刪除相關圖片，刪除分類關係，刪除variant
  deleteRealte(useData.id)

  res.status(200).json();

})

async function updateCategoryNumber(id) {
  const list = await ProductCategoriesOnProducts.getList({ productId: id })
  for (item of list) {
    let result = await ProductCategoriesOnProducts.getCount({
      productStatus: 1,
      productCategoryId: item.productCategoryId
    })
    await productCategory.update({ id: item.productCategoryId }, { number: result.total })
  }
}

async function deleteRealte(id) {
  await updateCategoryNumber(id)
  ProductCategoriesOnProducts.delete({ productId: id })
  productVariant.delete({ productId: id })
}
