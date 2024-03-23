// const Member = require(process.cwd() + '/models/member/member')

module.exports = {
  auth: auth,
}

function auth (req, res, next) {
  if (!req.session.user) {
    res.status(403).json({msg: 'No login'})
  } else {
  	next()
  }
}
