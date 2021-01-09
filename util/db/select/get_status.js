'use strict';
const { init_db_operation } = require('../../../db/db');

const get_status_from_local = async () => {
  try {
    const sql_select = `SELECT status, status_uk, status_ru FROM all_status`;
    return await init_db_operation(sql_select, null, true);
  } catch (err) {
    console.log(err);
  }
};

exports.get_status_from = async () => await get_status_from_local();

exports.get_status_goods = async (language) => {
  try {
    const status_result = await get_status_from_local();
    return status_result
      .map((status) =>
        Object.entries(status)
          .map(([key, value]) =>
            key.split('_').length == 2 && key.split('_')[1][0] == language[0]
              ? value
              : null
          )
          .filter((e) => e)
      )
      .flat();
  } catch (err) {
    console.log('get_status_goods', err);
  }
};
