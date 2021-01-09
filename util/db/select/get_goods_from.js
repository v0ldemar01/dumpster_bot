'use strict';
const { init_db_operation } = require('../../../db/db');
const { select_state } = require('../../state/state');
const filter = ['selected_budget', 'selected_color', 'selected_mem'];

const get_tables = async (connection) => {
  const sql = `SHOW TABLES`;
  try {
    const data = await init_db_operation(sql, null, true);
    return data[0].map((row) => Object.values(row).join(" "));
  } catch (err) {
    console.log('get_tables', err);
  }
};

exports.get_goods_from = async (user_id) => {
  try {
    const switch_data = await select_state(user_id, false, true);
    let isBudget;
    let color;
    let memory;
    const switch_data_array = Object.entries(switch_data)
      .map(([key, value]) => {
        if (key == filter[0] && key == filter[0] && value) {
          isBudget = value;
        } else if (key == filter[1] && key == filter[1] && value) {
          color = value;
        } else if (key == filter[2] && key == filter[2] && value) {
          memory = value;
        } else if (value) return value;
      })
      .filter((element) => element);
    if (!switch_data_array.length) return;

    const sql_input = switch_data_array[0]
      .split(' ')
      .map((switch_data_element) => {
        const switch_data_element_array = switch_data_element.split('__');
        let is_accessory;
        if (switch_data_element_array[1].includes('aksesuari'))
          is_accessory = true;
        const sql_switch = is_accessory
          ? ") AND is_accessory IS NOT NULL"
          : ` AND is_accessory IS NULL AND brand_id IN (SELECT id FROM brands WHERE brand_name_en = '${switch_data_element_array[1]}'))`;
        const budget = isBudget ? ` AND price < ${isBudget + 1500}` : "";
        const color_chunk = color ? `color = '${color}' AND` : "";
        const memory_chunk = memory ? `rom = ${memory}  AND` : "";
        return (
          `SELECT * FROM goods WHERE ${color_chunk} ${memory_chunk} category_brand_id IN ` +
          `(SELECT id FROM categories_brands WHERE category_id = ` +
          `(SELECT id FROM categories WHERE category_name_en = '${switch_data_element_array[0]}' )${sql_switch}${budget}`
        );
      });
    const inline_input_result = [];
    console.log(sql_input);
    for (const sql of sql_input) {
      const result = await init_db_operation(sql, null, true);
      inline_input_result.push(result);
    }
    //const inline_input_result = await Promise.allSettled(sql_input);
    //return inline_input_result.map(({value}) => value[0]).reduce((acc, cur) => [...acc, ...cur], []);
    return inline_input_result.reduce((acc, cur) => [...acc, ...cur], []);
  } catch (err) {
    console.log('get_goods_from', err);
  }
};

exports.smart_get_goods = async (input, isMemory) =>
  await smart_get_goods_from(input, isMemory);

const combine = (a) =>
  a.reduce((a, b) => a.flatMap((d) => b.map((e) => [d, e].flat())));

const split_array_by_markovskij = (array, force) => {
  try {
    const result_array = [];
    array.forEach((element, i, self) => {
      if (i == self.length - 1) {
        if (!force) {
          result_array.push([element, self[0]]);
          result_array.push([self[0], element]);
        }
        result_array.push(self);
      } else {
        result_array.push([element, self[i + 1]]);
        !force ? result_array.push([self[i + 1], element]) : null;
      }
      result_array.push([element]);
    });
    const new_result_array = force
      ? result_array.sort(
          (result_array_el1, result_array_el2) =>
            result_array_el2.length - result_array_el1.length
        )
      : result_array.filter(
          (element, index, self) =>
            index ===
            self.findIndex(
              (elem) =>
                elem.length == element.length &&
                elem.every((v, i) => v === element[i])
            )
        );

    if (force)
      return new_result_array.map((element) =>
        element.length == 1 ? [array.join(" ")] : element
      );
    return new_result_array;
  } catch (err) {
    console.log('split_array_by_markovskij', err);
  }
};

const combine_all_variants = (array, text_many, force) => {
  try {
    let result_array = [];
    const split_array = array[text_many];
    const marik_split = split_array_by_markovskij(split_array, force);
    [...Array(marik_split.length)].forEach((_) =>
      result_array.push([...array])
    );
    return result_array.map((result_array_element, index) => {
      result_array_element.splice(
        text_many,
        1,
        ...marik_split[index].map((e) => [e])
      );
      return result_array_element;
    });
  } catch (err) {
    console.log('combine_all_variants', err);
  }
};

const combine_function = (sql_fields, sql_values) => {
  try {
    const state_fields = sql_fields.length ? combine(sql_fields) : [];
    !Array.isArray(state_fields[0])
      ? (state_fields[0] = [state_fields[0]])
      : null;
    const state_values = sql_values.length ? combine(sql_values) : [];
    !Array.isArray(state_values[0])
      ? (state_values[0] = [state_values[0]])
      : null;
    return [state_fields, state_values];
  } catch (err) {
    console.log('combine_function', err);
  }
};

const generate_sql = (state_fields, state_values, is_category) => {
  try {
    return state_fields.map((sql_field_array, index) => {
      sql_field_array = !Array.isArray(sql_field_array)
        ? [sql_field_array]
        : sql_field_array;
      let count = 0;
      let sql = 'SELECT * FROM goods WHERE';
      sql_field_array.forEach((sql_field_element, i) => {
        let sql_injection;
        if (
          sql_field_element.includes('category') ||
          sql_field_element.includes('brand')
        ) {
          if (sql_field_element.includes('category')) {
            sql_injection = `${ count ? ' AND' : ''}` + 
            ` category_id = (SELECT id FROM categories WHERE category_name_en = ` + 
            `'${ state_values[index][i] }' )) `;
          } else {
            sql_injection = `${ count ? ' AND' : '' }` + 
            ` brand_id IN (SELECT id FROM brands WHERE brand_name = ` + 
            `'${ state_values[index][i] }' ) ${is_category ? '' : ')'}`;
          }
          if (!count)
            sql +=
              ' category_brand_id IN (SELECT id FROM categories_brands WHERE ';
          count++;
        } else {
          sql_injection = `${ count || i ? ' AND' : '' } ${sql_field_element} ` + 
          ` LIKE '%${Array.isArray(state_values[index]) ? state_values[index][i] : state_values[index] }%'`;
        }
        sql += sql_injection;
      });
      return sql;
    });
  } catch (err) {
    console.log('generate_sql', err);
  }
};

const smart_get_goods_from = async (user_id) => {
  try {
    let switch_data = await select_state(user_id, true);
    const sql_state_to_state = {
      ['selected_memory']: ['ram', 'rom'],
      ['selected_diagonal']: ['screen_diagonal'],
      ['selected_date']: ['creation_year'],
      ['selected_text']: ['name', 'color'],
      ['selected_number']: ['name', 'article', 'ram'],
      ['selected_brand']: ['brand_name'],
      ['selected_category']: ['category_name'],
      ['selected_status']: ['status'],
    };
    let sql_fields = [];
    let sql_values = [];
    let sql_state = [];
    let is_category;
    let text_many;

    if (
      switch_data &&
      Object.values(switch_data).filter((element) => element).length
    ) {
      Object.entries(switch_data)
        .filter(([key, value]) => value)
        .forEach(([key, value], index) => {
          if (!value) return;
          if (key == 'selected_category' && key == 'selected_category' && value)
            is_category = true;
          sql_fields.push(sql_state_to_state[key]);
          if (isNaN(value) && value.split(' ').length != 1) {
            text_many = index;
            Array.isArray(sql_state_to_state[key])
              ? sql_values.push(switch_data[key].split(' '))
              : null;
          } else {
            Array.isArray(sql_state_to_state[key])
              ? sql_values.push(
                  sql_state_to_state[key].map((_) => switch_data[key])
                )
              : null;
          }
        });

      let state_fields = [];
      let state_values = [];

      if (text_many != undefined) {
        sql_fields = combine_all_variants(sql_fields, text_many);
        sql_values = combine_all_variants(sql_values, text_many, true);
        [...Array(sql_fields.length)].forEach((_, i) => {
          const [state_fields_element, state_values_element] = combine_function(
            sql_fields[i],
            sql_values[i]
          );
          state_fields = [...state_fields, state_fields_element];
          state_values = [...state_values, state_values_element];
        });
        [...Array(state_fields.length)].forEach((_, i) => {
          const sql_state_element = generate_sql(
            state_fields[i],
            state_values[i],
            is_category
          );
          sql_state = [...sql_state, sql_state_element];
        });
        sql_state = sql_state.map((element) => element[0]);
      } else {
        [state_fields, state_values] = combine_function(sql_fields, sql_values);
        sql_state = generate_sql(state_fields, state_values, is_category);
      }
    } else {
      const sql_select = 'SELECT * FROM goods';
      !Array.isArray(sql_state) ? (sql_state = []) : sql_state;
      sql_state.push(sql_select);
    }
    const sql_result_ready = [];
    for (const sql_select of sql_state) {
      console.log(sql_select);
      const result = await init_db_operation(sql_select, null, true);
      sql_result_ready.push(result);
    }
    // const sql_result = sql_state.map(sql_select => connection.query(sql_select));
    // let sql_result_ready = await Promise.all(sql_result);
    return sql_result_ready
      .filter((array_result) => array_result.length)
      .flat();
  } catch (err) {
    console.log('smart_get_goods_from', err);
  }
};
