const router = require("express-promise-router")({ mergeParams: true })
const wrapValidator = require(process.cwd() + '/tools/validator')
const PostImage = require(process.cwd() + '/models/post/postImage')
const Post = require(process.cwd() + '/models/post/post')
const multer  = require('multer')
const upload = multer({ dest: 'tmp' })
const { authStore }= require(process.cwd() + '/tools/libs')
const sharp = require("sharp")

module.exports = router

router.get('/', async function(req, res, next) {
  const useData = {
		storeId: req.query.storeId,
    postId: req.params.postId,
		status: req.query.status || '1',
  }

  const validator = wrapValidator(useData, {
		storeId: 'numeric|min:1',
    postId: 'required|numeric|min:1',
		status: 'enum:statusQuery', // all:查詢全部, 0:未公開, 1:已公開
  }, 'post')
  
  if (validator.fail) {
  	return next({statusCode: 400, ...validator.errors})
  }
  
  if (!await authStore(req, next, {
    storeId: useData.storeId,
    status: useData.status,
    role: ['owner', 'editor']
  })) return

  if (useData.status === '1') {
    // 公開圖片需跟隨產品狀態是否上架，這樣可不必維護PostImage.status的資料
    let post = await Post.getOne({ id: useData.postId })
    if (post.status !== 1) return next({statusCode: 403 })
  }

  delete useData.status
  useData.sortBy = 'priority'
  useData.orderBy = 'ASC'
	
	let result = await PostImage.getList(useData)

  for(const key in result) {
    result[key].baseUrl = process.env.BASE_URL
  }
	
	res.json(result)

})

router.post('/', upload.any('files'), async function (req, res, next) {
  
  const useData = {
		storeId: req.body.storeId,
    postId: req.params.postId,
    priority: req.body.priority,
    createBy: req.session.user.id,
		updateBy: req.session.user.id
	}

  const validator = wrapValidator(useData, {
		storeId: 'required|numeric|min:1',
    postId: 'required|numeric|min:1',
    priority: 'numeric'
  }, 'post')
  
  if (validator.fail) {
  	return next({statusCode: 400, ...validator.errors})
  }

  if (!await authStore(req, next, {
    storeId: useData.storeId,
    role: ['owner', 'editor']
  })) return

  // 檢查檔案格式
  const fs = require('fs');
  let checkFile = true
  const allowType = ['image/jpeg', 'image/png', 'image/webp']
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
      errors: { images: [ '圖片格式必須是jpg, png, webp' ] }
    })
  }

  for (const file of req.files) {

    file.originalname = Buffer.from(file.originalname, 'latin1').toString(
      'utf8',
    );

    let ext = '.' + file.originalname.split('.').pop()

    useData.originalname = file.originalname
    useData.filename = 'default' + ext
    useData.size = file.size
    let result = await PostImage.create(useData)
    
    let dir = '/uploads/post-images/' + result[0];

    await PostImage.update({ id: result[0] }, { path: dir, priority: result[0] })

    let oldPath = './tmp/' + file.filename
    let convertPath = './tmp/convert'
    // 壓縮圖片
    let isCompress = false
    if (file.mimetype.indexOf('jpeg') > -1) {
      await sharp(oldPath).jpeg({ quality: 60 }).keepExif().keepMetadata().toFile(convertPath);
      isCompress = true
    } else if (file.mimetype.indexOf('png') > -1) {
      await sharp(oldPath).png({ quality: 60 }).keepExif().keepMetadata().toFile(convertPath);
      isCompress = true
    } else {
      fs.copyFileSync(oldPath, convertPath)
    }

    // 移動檔案
    dir = './public' + dir
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.renameSync(convertPath, dir + '/' + useData.filename)
    if (isCompress) {
      fs.renameSync(oldPath, dir + '/' + file.originalname) // 有壓縮保留原始檔
    } else {
      fs.unlinkSync(oldPath); // 沒有壓縮刪掉原始檔
    }

  }
  
  res.status(200).json();
});

router.put('/:postImageId', async function(req, res, next) {
	
	const useData = {
		id: req.params.postImageId,
    storeId: req.query.storeId,
    postId: req.params.postId,
    priority: req.body.priority,
		updateBy: req.session.user.id,
  }
  
  const validator = wrapValidator(useData, {
		id: 'required|numeric|min:1',
    storeId: 'required|numeric|min:1',
    postId: 'required|numeric|min:1',
    priority: 'numeric'
  }, 'post');
  
  if (validator.fail) {
    next({statusCode: 400, ...validator.errors}); return;
  }
  
  if (!await authStore(req, next, {
    storeId: useData.storeId,
    role: ['owner', 'editor']
  })) return
  
  result = await PostImage.update({ id: useData.id }, useData)
  
  res.status(200).json();
})

router.delete('/:postImageId', async function(req, res, next) {
  const useData = {
		id: req.params.postImageId,
    storeId: req.query.storeId,
    postId: req.params.postId,
  }

  const validator = wrapValidator(useData, {
		id: 'required|numeric|min:1',
    storeId: 'required|numeric|min:1',
    postId: 'required|numeric|min:1',
  }, 'post');
  
  if (validator.fail) {
    next({statusCode: 400, ...validator.errors}); return;
  }
  
  if (!await authStore(req, next, {
    storeId: useData.storeId,
    role: ['owner', 'editor']
  })) return
  
  await PostImage.delete({ id: useData.id })
  
  // 刪除圖片
  const fs = require('fs');
  let dir = './public/uploads/post-images/' + useData.id
  fs.rm(dir, { recursive: true, force: true }, () => {})

  res.status(200).json();
})