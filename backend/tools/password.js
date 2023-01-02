var crypto = require('crypto');
var bcrypt = require('bcrypt');

var SaltLength = 9;

function createHash(password) {
  var salt = generateSalt(SaltLength);
  var hash = md5(password + salt);
  return salt + hash;
}

async function validateHash(hash, password) {
  hash = hash.replace('$2y$', '$2a$');
  return await bcrypt.compare(password, hash);
}

async function hashIt(password){
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

function generateSalt(len) {
  var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ',
      setLen = set.length,
      salt = '';
  for (var i = 0; i < len; i++) {
    var p = Math.floor(Math.random() * setLen);
    salt += set[p];
  }
  return salt;
}

function md5(string) {
  return crypto.createHash('md5').update(string).digest('hex');
}

module.exports = {
  'hash': hashIt,
  'validate': validateHash
};