'use strict';
const path =
  global.os == 'win32'
    ? __dirname.split('\\').slice(0, -1).join('\\')
    : __dirname.split('/').slice(0, -1).join('/');
require('dotenv').config({ path: path + '/.env' });
const { createPool } = require('mysql2');

const { DB_HOST, DB_POOL_SIZE, DB_USER, DB_NAME, DB_PASS } = process.env;

const db = createPool({
  connectionLimit: DB_POOL_SIZE,
  host: DB_HOST,
  user: DB_USER,
  database: DB_NAME,
  password: DB_PASS,
}).promise();

exports.init_db_operation = async (sql, argument, full_format) => {
  let result;
  const connection = await db.getConnection();
  const prev_sql = 'SET FOREIGN_KEY_CHECKS=0';
  const next_sql = 'SET FOREIGN_KEY_CHECKS=1';
  try {
    await connection.beginTransaction();
    await connection.query(prev_sql);

    result = argument
      ? await connection.query(sql, argument)
      : await connection.query(sql);
    if (
      sql.includes('INSERT') ||
      sql.includes('DELETE') ||
      sql.includes('UPDATE')
    )
      await connection.commit();

    await connection.query(next_sql);
  } catch (err) {
    console.log('init_db_operation', err);
    await connection.rollback();
  } finally {
    await connection.release();
    return full_format ? result[0] : result[0][0];
  }
};
