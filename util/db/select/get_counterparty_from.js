'use strict';
const { init_db_operation } = require('../../../db/db');

exports.get_counterparty = async (name, contact) => {
  try {
    const sql = `SELECT id FROM counterparty WHERE full_name LIKE '%${name}%' AND phone LIKE '%${contact}%'`;
    return await init_db_operation(sql, null, true);
  } catch (err) {
    console.log('get_counterparty', err);
  }
};
