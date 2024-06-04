const router = require("express-promise-router")({ mergeParams: true })
const wrapValidator = require(process.cwd() + '/tools/validator')
const Store = require(process.cwd() + '/models/store/store')
const StoreImage = require(process.cwd() + '/models/store/storeImage')
const multer  = require('multer')
const upload = multer({ dest: 'tmp' })
const { authStore, authUserStoreRole }= require(process.cwd() + '/tools/libs')

module.exports = router

router.get('/', async function(req, res, next) {
  const useData = {
		storeId: req.params.storeId,
		status: req.query.status || '1',
    type: req.query.type,
  }

  const validator = wrapValidator(useData, {
		storeId: 'numeric|min:1',
		status: 'enum:statusQuery', // all:查詢全部, 0:未公開, 1:已公開
    type: 'enum:type', // 0:cover, 1:avator
  }, 'storeImage')
  
  if (validator.fail) {
  	return next({statusCode: 400, ...validator.errors})
  }

  if (!await authStore(req, next, {
    storeId: useData.storeId,
    status: useData.status,
    role: ['owner', 'editor']
  })) return

  // if (useData.status === '1') {
    // 公開圖片需跟隨商店狀態是否上架，這樣可不必維護storeImage.status的資料
  //   let store = await Store.getOne({ id: useData.storeId })
  //   if (store.status !== 1) return next({statusCode: 403 })
  // } else {
  //   if (!await authUserStoreRole(req, next, useData.storeId, ['owner', 'editor'])) return
  // }

  delete useData.status
  useData.sortBy = 'priority'
  useData.orderBy = 'ASC'
	
	let result = await StoreImage.getList(useData)

  for(const key in result) {
    result[key].baseUrl = process.env.BASE_URL
  }
	
	res.json(result)
})

router.post('/', upload.any('files'), async function (req, res, next) {
  
  const useData = {
		storeId: req.body.storeId,
    type: req.body.type,
    priority: req.body.priority,
    createBy: req.session.user.id,
		updateBy: req.session.user.id
	}

  const validator = wrapValidator(useData, {
		storeId: 'required|numeric|min:1',
    type: 'required|enum:type',
    priority: 'numeric'
  }, 'storeImage')
  
  if (validator.fail) {
  	return next({statusCode: 400, ...validator.errors})
  }

  if (!await authUserStoreRole(req, next, useData.storeId, ['owner', 'editor'])) {
  	return
  }

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
    let result = await StoreImage.create(useData)
    
    let dir = '/uploads/store-images/' + result[0];

    await StoreImage.update({ id: result[0] }, { path: dir, priority: result[0] })

    // 移動檔案
    dir = './public' + dir
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    let oldPath = './tmp/' + file.filename
    let newPath = dir + '/' + useData.filename
    fs.renameSync(oldPath, newPath)

  }
  
  res.status(200).json();
});

router.put('/:storeImageId', async function(req, res, next) {
	
	const useData = {
		id: req.params.storeImageId,
    storeId: req.query.storeId,
    type: req.body.type,
    priority: req.body.priority,
		updateBy: req.session.user.id,
  }
  
  const validator = wrapValidator(useData, {
		id: 'required|numeric|min:1',
    storeId: 'required|numeric|min:1',
    type: 'enum:type',
    priority: 'numeric'
  }, 'storeImage');
  
  if (validator.fail) {
    next({statusCode: 400, ...validator.errors}); return;
  }
  
  if (!await authUserStoreRole(req, next, useData.storeId, ['owner', 'editor'])) {
  	return
  }
  
  result = await StoreImage.update({ id: useData.id }, useData)
  
  res.status(200).json();
})

router.delete('/:storeImageId', async function(req, res, next) {
  const useData = {
		id: req.params.storeImageId,
    storeId: req.query.storeId,
  }

  const validator = wrapValidator(useData, {
		id: 'required|numeric|min:1',
    storeId: 'required|numeric|min:1',
  }, 'product');
  
  if (validator.fail) {
    next({statusCode: 400, ...validator.errors}); return;
  }
  
  if (!await authUserStoreRole(req, next, useData.storeId, ['owner', 'editor'])) {
  	return
  }
  
  await StoreImage.delete({ id: useData.id })
  
  // 刪除圖片
  const fs = require('fs');
  let dir = './public/uploads/store-images/' + useData.id
  fs.rm(dir, { recursive: true, force: true }, () => {})

  res.status(200).json();
})