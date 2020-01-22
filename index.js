require('dotenv').config()
const express = require('express')
const app = express()
const config = require('./config/config')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const session = require('express-session')

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.use(helmet())

//set session
var sess = {
  secret: '542A4D5AABF7A3D8531BB8A465F51',
  saveUninitialized: true,
  resave: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}
if(process.env.NODE_ENV === 'production'){
	app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}
app.use(session(sess))

//set config
app.locals.config = config

//set routes
const router = require('./config/routes');
app.use('/', router);

//error handle
app.use(function (err, req, res, next) {
  console.error(err)
  res.status(500)
  if (err.statusCode !== undefined) {
    res.status(err.statusCode)
    delete err.statusCode
  }
  res.json(err)
})

//set gzip
const compression = require('compression')
app.use(compression())
/*
app.set('view engine', 'ejs')
app.get('/', (req, res) => {
  res.render('index', { title: 'Hey', message: 'Hello there!' })
})*/

//set static folder
app.use(express.static(__dirname + '/dist', { maxAge: 31557600000 }));
app.use('/public', express.static(__dirname + '/public', { maxAge: 31557600000 }));
app.get('/*', (req, res) => {
  res.sendFile(__dirname + '/dist/index.html');
})

app.listen(config.port, function () {
  console.log('Start server at:' + config.base_url);
});

// var server = require('http').Server(app);
// var io = require('socket.io')(server);
// console.log('Start server at:' + config.base_url);
// server.listen(config.port);

// io.on('connection', function (socket) {
//   require('./tools/socket.js')(socket);
// });