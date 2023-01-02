
const config = {
  client: 'mysql',
  connection: {
    host: process.env.DB_HOST,
	  user: process.env.DB_USER,
	  password: process.env.DB_PASS,
    database: "ezgoo"
  },
  pool: {
    min: 0,
    max: 10,
  }
}

const knex = require('knex')(config);

module.exports = {
  knex: knex,
  config: config
}