'use strict';
const { init_db_operation } = require('../../../db/db');

exports.get_insert_status = async () => {
  try {
    const sql_select = `SELECT status, status_uk, status_ru FROM all_status`;
    const sql_insert =
      'INSERT INTO `store`.`all_status` (status, status_uk, status_ru) VALUES (?, ?, ?)';
    const result = await init_db_operation(sql_select);
    if (!result) {
      const data = [
        ['New', 'Новий', 'Новый'],
        ['Used', 'Вживаний', 'Б/у'],
      ];
      for (const data_element of data) {
        try {
          await init_db_operation(sql_insert, data_element);
        } catch (err) {
          console.log(err);
        }
      }
    }
  } catch (err) {
    console.log('get_insert_status', err);
  }
};
