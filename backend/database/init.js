
const config = {
  client: 'mysql',
  connection: {
    host: process.env.DB_HOST,
	  user: process.env.DB_USER,
	  password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    timezone: 'utc',
  },
  pool: {
    min: 0,
    max: 10,
    afterCreate: function(connection, callback) {
      connection.query("SET time_zone = '+0:00';", function(err) {
        callback(err, connection);
      });
    }
  }
}

const knex = require('knex')(config);

module.exports = {
  knex: knex,
  config: config
}