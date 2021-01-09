'use strict';
const { init_db_operation } = require('../../../db/db');

exports.get_insert_localities = async (data) => {
  try {
    const sql_clear = 'TRUNCATE counterparty';
    const sql_insert =
      'INSERT INTO `store`.`counterparty` (counterparty_id, full_name, phone) VALUES (?, ?, ?)';
    await init_db_operation(sql_clear);

    for (const data_element of data) {
      try {
        await init_db_operation(
          sql_insert,
          [...Object.values(data_element)].map((e) => (e ? e : ''))
        );
      } catch (err) {
        console.log(err);
      }
    }
  } catch (err) {
    console.log(err);
  }
};
