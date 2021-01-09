'use strict';
const { init_db_operation } = require('../../../db/db');

exports.get_columns_from = async (table = 'goods') => {
  try {
    const sql = `SHOW COLUMNS FROM ${table}`;
    return await init_db_operation(sql, null, true);
  } catch (err) {
    console.log('get_columns_from', err);
  }
};
