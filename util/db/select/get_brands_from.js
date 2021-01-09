'use strict';
const { init_db_operation } = require('../../../db/db');

exports.get_brands_from = async (category_name, count) => {
  try {
    const limit = count ? ` LIMIT ${count}` : '';
    let sql;
    if (!category_name) {
      sql = `SELECT * FROM brands ${limit} `;
    } else {
      sql = `SELECT  br.brand_name, br.brand_name_en, cat.category_name, cat.category_name_en, cat.category_name_ru FROM categories_brands AS cat_br
        JOIN categories AS cat
        ON cat_br.category_id = cat.id
        JOIN brands AS br
        ON cat_br.brand_id = br.id WHERE cat.category_name_en = '${category_name}' ${limit} AND cat_br.id IS NOT NULL AND cat_br.id IN 
          (SELECT category_brand_id FROM goods WHERE is_accessory IS NULL)`;
    }
    return await init_db_operation(sql, null, true);
  } catch (err) {
    console.log('get_brands_from', err);
  }
};

exports.get_brand_for_smart_search = async (name) => {
  try {
    const sql = `SELECT brand_name
      FROM brands`;
    return await init_db_operation(sql, null, true);
  } catch (err) {
    console.log('get_brand_for_smart_search', err);
  }
};
