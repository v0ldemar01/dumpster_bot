'use strict';
const {init_db_operation} = require('../../../db/db');
const {get_many_many} = require('../select/get_many_many');
const {get_categories_from} = require('../select/get_categories_from');
const {get_status_from} = require('../select/get_status');
const {current_goods_fields} = require('../../googlesheets/goods_card');
const {get_insert_status} = require('./get_insert_status');
const {translate_names} = require('../../language');

const secondary_used_words = ['Аксесуари', 'Xiaomi'];
const secondary_field_words = ['status', 'status_uk',
  'status_ru', 'name', 'product_description', 'img_src', 'price', 'category_brand_id',
  'is_accessory', 'meta_href', 'article', 'code', 'ms_goods_id', 'product_description_ru', 'image_filename', 'image_updated'];

const check_current_goods = async (ms_goods_id, image)=> {
  try {
    const sql_select = `SELECT id FROM goods WHERE ms_goods_id = ?` 
    + `${image?.filename ? ' AND image_filename = ?' : ''}` + 
      `${image?.updated ? ' AND image_updated = ?' : ''} `;
    const result = await init_db_operation(sql_select, [ms_goods_id, image?.filename, image?.updated].filter(e => e));
    if (result && result.id != null) {
      return true;
    }
    return false;
  } catch (err) {
    console.log('get_all_goods', err);
  }
};

exports.check_prev_new_goods = async goods => {
  try {
    const new_goods = [];
    const old_goods = [];
    for (const goods_card of goods) {      
      const {id, image} = goods_card;
      const check = await check_current_goods(id);      
      if (check) {
        old_goods.push(goods_card);
      } else {
        new_goods.push(goods_card);        
      }
    }
    return [new_goods, old_goods];
  } catch (err) {
    console.log('check_prev_new_goods', err);
  }
};

const prepare_insert = data => { 
  try {
    const field_names = [];
    const field_values = [];
    data.forEach(data_element => {    
      const obj_data = Object.fromEntries(data_element);
      const field_data_names = [];
      const field_data_values = [];
      Object.entries(obj_data).forEach(([key, value]) => {
        field_data_names.push(key);
        field_data_values.push(value);
      });     
      field_names.push(field_data_names);
      field_values.push(field_data_values);  
    });   
    return {field_names, field_values};
  } catch (err) {
    console.log('prepare_insert', err);
  }  
};

const generate_insert = (names, values) =>  
  `INSERT INTO goods (${names.join(', ')}) VALUES (${Array(values.length).fill('?').join(', ')})`;

const generate_update = (names, values) => {
  const ms_goods_id_index = names.indexOf(secondary_field_words[12]);
  return `UPDATE \`invoice\` SET ${names.map((name, index) => `${name} = ${values[index]}`).join(', ')} WHERE ms_goods_id = ${values[ms_goods_id_index]} `;
}
  

const find_category_brand = (pathName, name, all_categories_brands) => {
  try {
    let category_brand_id;  
    const full_name = (pathName + '/' + name).toLowerCase();    
    all_categories_brands.forEach(({id, category_name, brand_name}) => {      
      if (full_name.includes(category_name.toLowerCase()) && full_name.includes(brand_name.toLowerCase())) {
        category_brand_id = id;
      }      
    });    
    return category_brand_id;
  } catch (err) {
    console.log('find_category_brand', err);
  }  
};

const insert_goods = async (data, insert) => {   
  try {   
    const {field_names, field_values} = prepare_insert(data); 
    for (let i = 0; i < field_names.length; i++) {
      try {        
        insert ?
          await init_db_operation(generate_insert(field_names[i], field_values[i]), field_values[i]) :  
          await init_db_operation(generate_update(field_names[i], field_values[i]));        
      } catch (err) {
        console.log('insert', err);
      }      
    }   
    console.log('Sql complete');
  } catch (err) {
    console.log('insert_goods', err);
  }    
};

const find_prod_code = name => {
  try {
    const name_array = name.split(' ');
    const product_code_index = name_array.findIndex(element => element.includes('('));
    const product_code = name_array[product_code_index] ? name_array[product_code_index].search(/\d/g) != -1 ? name_array[product_code_index] : null : null;  
    return product_code ? product_code.slice(1, product_code.length - 1) : null;
  } catch (err) {
    console.log('find_prod_code', err);
  }  
};

const split_description = (description, goods_fields) => {
  try {
    const description_row = description ? description.split('\n') : null; 
    if (!description_row) return;
    return description_row
      .map(element => {    
        let key_value = element.split(':');
        if (!key_value || !key_value[1]) return;      
        key_value[1] = key_value[1]?.trim();
        const new_key_value = goods_fields[key_value[0]];      
        if (!new_key_value) return;
        return [new_key_value, key_value[1]];
      })
      .filter(element => Array.isArray(element) ? element.length : element);  
  } catch (err) {
    console.log('split_description', err);
  }    
};
 
const translate_description = async data => {
  try {
    for (const array of data) {
      const arr = [...array];
      for (const array_element of arr) {
        if (array_element[0] == secondary_field_words[4]) {
          const description = array_element[1];
          const res = description ? await translate_names(description, 'ru', true) : '';
          description ? array.push([secondary_field_words[13], res]) : null;
        }
      }
    }
  } catch (err) {
    console.log('translate_description', err)
  }
};

exports.get_insert_goods = async (rows, new_goods) => {
  try {
    const goods_fields = await current_goods_fields();  
    const data_result = [];
    const all_categories_brands = await get_many_many();    
    const all_categories = await get_categories_from(); 

    await get_insert_status(); 
    const all_status = await get_status_from();
    const all_status_array = all_status
      .map(obj => Object.values(obj));   

    Array.isArray(rows) ? 
      rows.forEach(row => format_callback(row, [goods_fields, all_categories_brands, all_categories, all_status_array, data_result], new_goods)) : 
      rows && Object.keys(rows).length ? format_callback(rows, [goods_fields, all_categories_brands, all_categories, all_status_array, data_result]) : null;
    //await translate_description(data_result);
    await insert_goods(data_result, new_goods)
  } catch (err) {
    console.log('get_insert_goods', err);
  }  
}; 

const format_callback = (row, [goods_fields, all_categories_brands, all_categories, all_status_array, data_result], new_goods) => {
  try {
    let {id, meta, description, pathName, name, code, href, salePrices, attributes, image} = row;
    const key_value = [];
    const {value} = salePrices[0];

    description ? description = description.replace('″', '"') : null;
    description ? description = description.replace('‑', ' - ') : null;
    description ? description = description.replace('‑', ' - ') : null;      
    description ? description = description.replace(/(\<(\/?[^>]+)>)/g, '') : null;   
    const result_description = split_description(description, goods_fields);

    Array.isArray(result_description) ? result_description.forEach(key_value_element => {
      key_value.push(key_value_element);
    }) : null;
    Array.isArray(attributes) ? attributes.map(({name, value}) => {
      if (goods_fields[name]) key_value.push([goods_fields[name], value.name]);      
    }) : null;    
    
    const status = name.split(' ')[0];

    all_status_array.forEach((status_array, index) => {
      if (status_array.join(' ').includes(status)) status_array.forEach((status_array_element, i) => {
        key_value.push([secondary_field_words[i], status_array[i]]);
      })
    });

    key_value.push([secondary_field_words[3], name]);
    
    
    key_value.push([secondary_field_words[4], description]);    
    key_value.push([secondary_field_words[6], value]);
    
    let category_brand_id = find_category_brand(pathName, name, all_categories_brands);
    category_brand_id ? null : category_brand_id = 0;
    key_value.push([secondary_field_words[7], category_brand_id]); 

    if (pathName.includes(secondary_used_words[0])) {
      const current_category = pathName.split('/')[0];
      let current_category_id;      
      all_categories.forEach((category_element) => {
        const {id, category_name} = category_element;
        if (category_name == current_category) current_category_id = id;
      });       
      key_value.push([secondary_field_words[8], current_category_id]);      
    }  

    key_value.push([secondary_field_words[9], meta.href]);
    
    const productCode = find_prod_code(name);
    productCode ? key_value.push([secondary_field_words[10], productCode]) : null;

    key_value.push([secondary_field_words[11], code]);    
    key_value.push([secondary_field_words[12], id]);

    if (new_goods) {
      key_value.push([secondary_field_words[5], href]);
      key_value.push([secondary_field_words[14], image?.filename]);
      key_value.push([secondary_field_words[15], image?.updated]);
    }    

    data_result.push(key_value);
  } catch (err) {
    console.log('format_callback', err);
  }  
};
//const transpose = array => array.reduce((r, a) => a.map((v, i) => [...(r[i] || []), v]), []);