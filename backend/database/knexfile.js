// Update with your config settings.
const path = require('path');
require('dotenv').config({path: '../.env'});
const config = require('./init').config;

module.exports = {

  development: {
    ...config,
    migrations: {
      directory: path.join(__dirname, '/migrations'),
    },
  },

  staging: {
    ...config,
    migrations: {
      directory: path.join(__dirname, '/migrations'),
    },
  },

  production: {
    ...config,
    migrations: {
      directory: path.join(__dirname, '/migrations'),
    },
  }

};
