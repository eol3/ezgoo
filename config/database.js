var knex = require('knex')({
  client: 'mysql',
  connection: {
    host: process.env.DB_HOST,
	  user: process.env.DB_USER,
	  password: process.env.DB_PASS,
    database: "ezgoo",
    timezone: process.env.TZ
  },
  pool: { min: 0, max: 10 }
});

module.exports = knex