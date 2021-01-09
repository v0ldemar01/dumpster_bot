'use strict';
const { init_db_operation } = require('../../../db/db');
const { get_filter_brands } = require('./get_insert_brands');
const { get_categories_from } = require('../select/get_categories_from');
const { get_brands_from } = require('../select/get_brands_from');

const prepare_insert = (data, category_result, brand_result) => {
  try {
    const result = [];
    data.forEach(({ category_elem, brand_elem }) => {
      category_result.forEach(({ id, category_name }) => {
        //if (category_name.includes('_')) category_name = category_name.split('_').join(' ');
        const category_id = id;
        if (category_elem === category_name) {
          brand_elem.forEach((brand_elem_name) => {
            brand_result.forEach(({ id, brand_name }) => {
              const brand_id = id;
              if (brand_elem_name === brand_name) {
                result.push([category_id, brand_id]);
              }
            });
          });
        }
      });
    });
    return result;
  } catch (err) {
    console.log('prepare_insert', err);
  }
};

const insert_many_to_many = async (data) => {
  try {
    const sql_clear = 'TRUNCATE categories_brands';
    const sql =
      'INSERT INTO `store`.`categories_brands` (category_id, brand_id) VALUES (?, ?)';

    const category_result = await get_categories_from();
    const brand_result = await get_brands_from();
    const result = prepare_insert(data, category_result, brand_result);

    await init_db_operation(sql_clear);

    for (const res_elem of result) {
      await init_db_operation(sql, res_elem);
    }
    console.log('SQL success');
  } catch (err) {
    console.log('insert_many_to_many', err);
  }
};

const category_filter = ['Гаджети для спорту'];

exports.get_insert_many_to_many = async (rows) => {
  try {
    const many_to_many = [];
    rows.forEach((row) => {
      const { name, attribute } = row;
      let category_elem = name.split('/').length > 1 ? name.split('/')[0] : '';
      if (category_filter.includes(category_elem))
        category_elem = name.split('/')[1];
      const brand_elem = get_filter_brands(row);
      if (category_elem == '' || brand_elem == '') return;
      many_to_many.push({ category_elem, brand_elem: [brand_elem] });
    });
    const no_duplicate_many_to_many = many_to_many.filter(
      (element, index, self) =>
        element.category_elem &&
        index ===
          self.findIndex(
            (elem) =>
              elem.category_elem === element.category_elem &&
              elem.brand_elem.length == element.brand_elem.length &&
              elem.brand_elem.every((v, i) => v === element.brand_elem[i])
          )
    );
    const concat_new_many_to_many = no_duplicate_many_to_many.reduce(
      (acc, current) => {
        const elem = acc.find(
          (item) => item.category_elem === current.category_elem
        );
        if (!elem) {
          const newCurr = {
            category_elem: current.category_elem,
            brand_elem: current.brand_elem,
          };
          return [...acc, newCurr];
        } else {
          const currData = elem.brand_elem.filter(
            (d) => d === current.brand_elem
          );
          if (!currData.length) {
            elem.brand_elem.push(...current.brand_elem);
          }
          return acc;
        }
      },
      []
    );
    await insert_many_to_many(concat_new_many_to_many);
  } catch (err) {
    console.log('get_insert_many_to_many', err);
  }
};
