const { Pool } = require('pg');

const pool = new Pool({
  user:     'postgres',
  host:     'localhost',
  database: 'fixmystreet',
  password: '@deep0909',
  port:     5432
});

module.exports = pool;