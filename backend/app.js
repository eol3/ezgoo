const envFile = process.env.NODE_ENV ? '.env.' + process.env.NODE_ENV + '.local' : '.env'
require('dotenv').config({ path: envFile })
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const helmet = require('helmet')
const session = require('express-session')
const cookieParser = require('cookie-parser');
const FileStore = require('session-file-store')(session)

const compression = require('compression')
app.use(compression())

app.use(require('prerender-node').set('prerenderServiceUrl', process.env.PRERENDER_SERVICE_URL))

app.use('/uploads', express.static(process.cwd() + '/public/uploads', { maxAge: 31557600000 }))
app.use(express.static(process.cwd() + '/public/dist', { maxAge: 31557600000 }))

app.get('/*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
      next();
  } else if (req.originalUrl.startsWith('/uploads')) {
    res.status(404).send()
  } else {
    res.sendFile(process.cwd() + '/public/dist/index.html');
  }
})

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.use(helmet())

app.use(cookieParser());
var sess = {
  store: new FileStore({logFn: function(){}}),
  secret: '542A4D5AABF7A3D8531BB8A465F51',
  saveUninitialized: false,
  resave: false,
  rolling: true, // 不停延長session
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }
}
if(process.env.NODE_ENV === 'production'){
	app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}
app.use(session(sess))

//set routes
const router = require('./config/routes');
app.use('/', router);

// 400 表單錯誤、資料驗證錯誤, 403 禁止存取, 404 找不到資料, 422 資料錯誤, 500 系統錯誤
app.use(function (err, req, res, next) {
  if (err.statusCode !== undefined) {
    res.status(err.statusCode)
    delete err.statusCode
    // if (err.msg === undefined) err.msg = 'bad request'
    res.json(err)
  } else {
    const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    console.error('request url:' + fullUrl)
    console.error(err)
    res.status(500)
    res.json({msg: 'Internal Server Error'})
  }
})

app.listen(process.env.PORT, function () {
  console.log('Start server at:' + process.env.BASE_URL);
});