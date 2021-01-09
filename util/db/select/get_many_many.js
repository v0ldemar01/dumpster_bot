'use strict';
const { init_db_operation } = require('../../../db/db');

exports.get_many_many = async () => {
  try {
    const sql = `SELECT cat_br.id, br.brand_name, br.brand_name_en, cat.category_name, cat.category_name_en, cat.category_name_ru FROM categories_brands AS cat_br
      JOIN categories AS cat
      ON cat_br.category_id = cat.id
      JOIN brands AS br
      ON cat_br.brand_id = br.id`;
    return await init_db_operation(sql, null, true);
  } catch (err) {
    console.log('get_many_many', err);
  }
};
