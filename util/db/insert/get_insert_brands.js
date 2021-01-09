'use strict';
const { init_db_operation } = require('../../../db/db');
const { transliterate_names } = require('../../language');
const filter = ['Бренд'];
const second_filter = ['Xiaomi'];

const insert_brands = async (brands_name) => {
  try {
    const sql_clear = 'TRUNCATE brands';
    const sql =
      'INSERT INTO `store`.`brands` (brand_name, brand_name_en) VALUES (?, ?)';

    await init_db_operation(sql_clear);
    const brands_name_en = transliterate_names(brands_name);
    const fix_many_words = (text) =>
      text?.split(' ')
        ? text?.split(' ').length != 1
          ? text?.split(' ').join('_').toLowerCase()
          : text.toLowerCase()
        : '';
    for (let i = 0; i < brands_name.length; i++) {
      try {
        await init_db_operation(sql, [
          brands_name[i].trim(),
          fix_many_words(brands_name_en[i].trim()),
        ]);
      } catch (err) {
        console.log('inserting_brands', err);
      }
    }
  } catch (err) {
    console.log('insert_brands', err);
  }
};

const findAllIndexesByElement = (str, element, indexArr = [], first = 0) => {
  const iArr = [...indexArr];
  const index = str.indexOf(element, first);
  iArr.push(index);
  return index != -1 || index == str.length - 1
    ? findAllIndexesByElement(str, element, iArr, index + 1)
    : indexArr;
};

const filter_brands = (row, brands) => {
  try {
    const { name, attribute } = row;
    const goods_status = ['Used', 'New'];
    if (name.split("/").length <= 1) return;
    if (second_filter.includes(name.split('/')[0])) {
      const new_element = name.split("/")[1];
      if (brands && brands && Array.isArray(brands)) {
        return brands.push(new_element);
      } else {
        return new_element;
      }
    }
    let indexLatinName = name.indexOf(name.match(/\d*[a-zA-Z]/));
    //const indexes_by_split_element = findAllIndexesByElement(name, '/');
    let new_element = name.slice(
      indexLatinName == -1 ? name.length : indexLatinName
    );
    new_element = new_element
      .split('/')
      .map((row_element, index) => {
        !index
          ? goods_status.forEach((goods_status) => {
              if (row_element.includes(goods_status)) {
                row_element = row_element.split(" ").slice(1).join(" ");
              }
            })
          : null;
        return row_element;
      })
      .join('/');
    if (new_element.includes('/')) {
      const prev_new_element = new_element.split('/')[0];
      new_element =
        prev_new_element.split(' ').length != 1
          ? prev_new_element.split(' ').slice(0, 3).join(" ")
          : prev_new_element;
      new_element = new_element.replace('computers', '');
      new_element = new_element.replace('(', '');
      new_element = new_element.replace(')', '');
    } else {
      new_element = new_element.split(' ')[0];
    }
    new_element = new_element.includes('-') ? '' : new_element;
    const filter_other = (element) => (element && element != '' ? element : '');

    Array.isArray(attribute)
      ? attribute.map(({ name, value }) => {
          if (name == filter[0] && value.name) {
            if (value.name != new_element) new_element = value.name;
          }
        })
      : null;
    if (brands && brands && Array.isArray(brands))
      return filter_other(new_element) == '' ? null : brands.push(new_element);
    return new_element;
  } catch (err) {
    console.log('filter_brands', err);
  }
};

exports.get_filter_brands = (name) => filter_brands(name);

exports.get_insert_brands = async (rows) => {
  try {
    const brands = [];
    rows.forEach((row) => filter_brands(row, brands));
    const filter_brands_array = [...new Set(brands)].filter(
      (element) => element && element != ''
    );
    await insert_brands(filter_brands_array);
  } catch (err) {
    console.log('get_insert_brands', err);
  }
};
