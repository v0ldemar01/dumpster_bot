'use strict';
const { init_db_operation } = require('../../../db/db');

exports.get_categories_from = async (force) => {
  try {
    let sql = `SELECT * FROM categories`;
    if (force)
      sql = `SELECT categories.category_name, categories.category_name_en, categories.category_name_ru, categories.is_accessory FROM categories 
      WHERE categories.id IN 
        (SELECT categories_brands.category_id FROM categories_brands 
          WHERE categories_brands.id IN 
            (SELECT category_brand_id FROM goods))`;
    return await init_db_operation(sql, null, true);
  } catch (err) {
    console.log('get_categories_from', err);
  }
};

exports.get_category_id_by_name = async (name) => {
  try {
    const sql = `SELECT id FROM categories WHERE category_name = ${name}`;
    return await init_db_operation(sql, null, true);
  } catch (err) {
    console.log('get_category_id_by_name', err);
  }
};

exports.get_accessories_to_category = async (category_name_en) => {
  try {
    const sql = `SELECT category_name, category_name_ru, category_name_en 
      FROM categories WHERE is_accessory IN 
        (SELECT id FROM categories 
          WHERE category_name_en = '${category_name_en}')`;
    return await init_db_operation(sql, null, true);
  } catch (err) {
    console.log('get_accessories_to_category', err);
  }
};

exports.get_all_accessories_to_category = async () => {
  try {
    const sql = `SELECT categor1.category_name, categor1.category_name_ru, categor1.category_name_en, categor2.category_name_en AS category_name_parent
      FROM categories categor1,  categories categor2 WHERE categor1.is_accessory = categor2.id`;
    return await init_db_operation(sql, null, true);
  } catch (err) {
    console.log('get_all_accessories_to_category', err);
  }
};

exports.get_category_for_smart_search = async (name) => {
  try {
    const sql = `SELECT category_name_en, category_name_ru, category_name 
      FROM categories`;
    return await init_db_operation(sql, null, true);
  } catch (err) {
    console.log('get_category_for_smart_search', err);
  }
};
