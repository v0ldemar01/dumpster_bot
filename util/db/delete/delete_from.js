'use strict';
const { init_db_operation } = require('../../../db/db');

exports.delete_from = async (table) => {
  try {
    const sql = `TRUNCATE ${table}`;
    await init_db_operation(sql);
  } catch (err) {
    console.log(err);
  }
};
