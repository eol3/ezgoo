const router = require("express-promise-router")({ mergeParams: true })
const wrapValidator = require(process.cwd() + '/tools/validator')
const ProductImage = require(process.cwd() + '/models/product/productImage')
const Product = require(process.cwd() + '/models/product/product')
const multer  = require('multer')
const upload = multer({ dest: 'tmp' })
const { authStore }= require(process.cwd() + '/tools/libs')
const sharp = require("sharp");

module.exports = router

router.get('/', async function(req, res, next) {
  const useData = {
		storeId: req.query.storeId,
    productId: req.params.productId,
		status: req.query.status,
  }

  const validator = wrapValidator(useData, {
		storeId: 'numeric|min:1',
    productId: 'required|numeric|min:1',
		status: 'enum:statusQuery', // all:查詢全部, 0:未公開, 1:已公開
  }, 'product')
  
  if (validator.fail) {
  	return next({statusCode: 400, ...validator.errors})
  }

  if (!await authStore(req, next, {
    storeId: useData.storeId,
    status: useData.status,
    role: ['owner', 'editor']
  })) return

  if (useData.status === '1') {
    // 公開圖片需跟隨產品狀態是否上架，這樣可不必維護productImage.status的資料
    let product = await Product.getOne({ id: useData.productId })
    if (product.status !== 1) return next({statusCode: 403 })
  }

  delete useData.status
  useData.sortBy = 'priority'
  useData.orderBy = 'ASC'
	
	let result = await ProductImage.getList(useData)
  
  for(const key in result) {
    result[key].baseUrl = process.env.BASE_URL
    result[key].options = JSON.parse(result[key].options)
    result[key].productOption = JSON.parse(result[key].productOption)
  }
	
	res.json(result)

})

router.post('/', upload.any('files'), async function (req, res, next) {
  
  const useData = {
		storeId: req.body.storeId,
    productId: req.params.productId,
    productOption: req.body.productOption || '[]' ,
    priority: req.body.priority,
    createBy: req.session.user.id,
		updateBy: req.session.user.id
	}

  const validator = wrapValidator(useData, {
		storeId: 'required|numeric|min:1',
    productId: 'required|numeric|min:1',
    priority: 'numeric'
  }, 'product')
  
  if (validator.fail) {
  	return next({statusCode: 400, ...validator.errors})
  }

  if (!await authStore(req, next, {
    storeId: useData.storeId,
    role: ['owner', 'editor']
  })) return

  // 預設
  useData.options = '[]'

  // 檢查檔案格式
  const fs = require('fs');
  let checkFile = true
  const allowType = ['image/jpeg', 'image/png']
  for (const file of req.files) {
    if (!allowType.includes(file.mimetype)) {
      checkFile = false
      break;
    }
  }
  if (!checkFile) {
    for (const file of req.files) {
      fs.unlinkSync('tmp/' + file.filename);
    }
    return next({statusCode: 400,
      errors: { images: [ '圖片格式必須是jpg或png' ] }
    })
  }

  for (const file of req.files) {

    let ext = ''
    if (file.mimetype.indexOf('jpeg') > -1) ext = '.jpg'
    else if (file.mimetype.indexOf('png') > -1) ext = '.png'

    file.originalname = Buffer.from(file.originalname, 'latin1').toString(
      'utf8',
    );

    useData.originalname = file.originalname
    useData.filename = 'default' + ext
    useData.size = file.size
    let result = await ProductImage.create(useData)
    
    let dir = '/uploads/product-images/' + result[0];

    await ProductImage.update({ id: result[0] }, { path: dir, priority: result[0] })

    let oldPath = './tmp/' + file.filename
    let convertPath = './tmp/convert.jpg'
    // 壓縮圖片
    if (ext === '.jpg') {
      await sharp(oldPath).jpeg({ quality: 60 }).keepExif().keepMetadata().toFile(convertPath);
    } else if (ext === '.png') {
      await sharp(oldPath).png({ quality: 60 }).keepExif().keepMetadata().toFile(convertPath);
    }
    fs.unlinkSync(oldPath); // 刪掉原始檔

    // 移動檔案
    dir = './public' + dir
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    let newPath = dir + '/' + useData.filename
    fs.renameSync(convertPath, newPath)

  }
  
  res.status(200).json();
});

router.put('/:productImageId', async function(req, res, next) {
	
	const useData = {
		id: req.params.productImageId,
    storeId: req.query.storeId,
    productId: req.params.productId,
    priority: req.body.priority,
		updateBy: req.session.user.id,
  }
  
  const validator = wrapValidator(useData, {
		id: 'required|numeric|min:1',
    storeId: 'required|numeric|min:1',
    productId: 'required|numeric|min:1',
    priority: 'numeric'
  }, 'product');
  
  if (validator.fail) {
    next({statusCode: 400, ...validator.errors}); return;
  }
  
  if (!await authStore(req, next, {
    storeId: useData.storeId,
    role: ['owner', 'editor']
  })) return
  
  result = await ProductImage.update({ id: useData.id }, useData)
  
  res.status(200).json();
})

router.delete('/:productImageId', async function(req, res, next) {
  const useData = {
		id: req.params.productImageId,
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
  
  await ProductImage.delete({ id: useData.id })
  
  // 刪除圖片
  const fs = require('fs');
  let dir = './public/uploads/product-images/' + useData.id
  fs.rm(dir, { recursive: true, force: true }, () => {})

  res.status(200).json();
})