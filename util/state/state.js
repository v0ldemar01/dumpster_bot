'use strict';
const { init_db_operation } = require('../../db/db');
const { init_used_words } = require('./init');
const {
  get_category_for_smart_search,
} = require('../db/select/get_categories_from');
const { get_brand_for_smart_search } = require('../db/select/get_brands_from');
const { get_status_from } = require('../db/select/get_status');
const { exchange_rates } = require('../monobank/monobank');

const filter = ['categories', 'brands', 'budget', 'color', 'memory'];

exports.insert_state = async (ctx, state, user_id, text) => {
  try {
    const used_words = init_used_words(ctx);
    if (!Object.keys(used_words).length)
      return console.log('!Object.keys(used_words).length');
    let new_state;
    let sql_insert;
    if (typeof state === 'object') {
      const type_name =
        used_words[
          Object.keys(used_words)
            .map((key) => {
              if (text.includes(key)) return key;
              return;
            })
            .filter((row) => row)
        ];
      if (!type_name) return;
      if (type_name === 'selected_many') {
        new_state = state
          .flat()
          .filter((state_element) => state_element?.includes("_"))
          .join(' ');
        sql_insert = `UPDATE \`users\` SET ${type_name} = ? WHERE user_id = ${user_id}`;
      } else {
        sql_insert = `UPDATE \`users\` SET ${type_name} = ?  WHERE user_id = ${user_id}`;
        new_state = state
          .map((text) =>
            typeof text === 'object'
              ? text[0].toLowerCase()
              : text.toLowerCase()
          )
          .join(' ');
      }
    } else {
      new_state = state;
      sql_insert = `UPDATE \`users\` SET selected_budget = ?  WHERE user_id = ${user_id}`;
    }
    console.log('new_state', sql_insert, new_state);
    await init_db_operation(sql_insert, new_state ? new_state : " ");
  } catch (err) {
    console.log('insert_state', err);
  }
};

exports.select_state = async (user_id, is_smart_search, is_goods_search) => {
  try {
    let sql_select = `SELECT 
      selected_category, 
      selected_brand, 
      selected_memory, 
      selected_diagonal,
      selected_text,
      selected_date,
      selected_number,
      selected_budget, 
      selected_many,
      selected_color,
      selected_mem    
      FROM users WHERE user_id = ?`;
    if (is_smart_search) {
      sql_select = `SELECT  
        selected_brand,
        selected_category,
        selected_memory, 
        selected_diagonal,
        selected_text,
        selected_date, 
        selected_number,    
        selected_status
        FROM users WHERE user_id = ?`;
    } else if (is_goods_search) {
      sql_select = `SELECT 
        selected_budget, 
        selected_many,
        selected_color,
        selected_mem    
        FROM users WHERE user_id = ?`;
    }
    return await init_db_operation(sql_select, user_id);
  } catch (err) {
    console.log('select_state', err);
  }
};

exports.get_users_count = async () => {
  try {
    const sql_select = `SELECT count(*) AS count FROM users`;
    return await init_db_operation(sql_select);
  } catch (err) {
    console.log('get_users_count', err);
  }
};

exports.get_user_language = async (user_id) => {
  try {
    const sql_select = "SELECT language FROM users WHERE user_id = ?";
    return await init_db_operation(sql_select, user_id);
  } catch (err) {
    console.log('get_user_language', err);
  }
};

exports.set_user_language = async (user_id, language) => {
  try {
    const sql_update = `UPDATE \`users\` SET language = ? WHERE user_id = ?`;
    return await init_db_operation(sql_update, [language, user_id]);
  } catch (err) {
    console.log('set_user_language', err);
  }
};

exports.get_users_count_by_language = async (language) => {
  try {
    const sql_select = `SELECT count(*) AS count FROM users WHERE language = ?`;
    return await init_db_operation(sql_select, language);
  } catch (err) {
    console.log('get_users_count', err);
  }
};

exports.update_user_status = async (user_id, last_time, current_position) => {
  try {
    const sql_update = `UPDATE \`users\` SET last_time = ?, current_position = ?  WHERE user_id = ?`;
    return await init_db_operation(sql_update, [
      last_time,
      current_position,
      user_id,
    ]);
  } catch (err) {
    console.log('update_user_status', err);
  }
};

exports.update_city = async (user_id, city) => {
  try {
    const sql_update = `UPDATE \`users\` SET city = ? WHERE user_id = ?`;
    return await init_db_operation(sql_update, [city, user_id]);
  } catch (err) {
    console.log('update_city', err);
  }
};

exports.get_user_city = async (user_id) => {
  try {
    const sql_update = `SELECT city FROM users WHERE user_id = ?`;
    return await init_db_operation(sql_update, user_id);
  } catch (err) {
    console.log('get_user_city', err);
  }
};

exports.get_bot_user_info = async () => {
  try {
    const sql_select_user_info = `SELECT user_id, username, name, current_position, last_time, city FROM users`;
    const sql_select_favourites = `SELECT goods.ms_goods_id, favourites.user_id FROM favourites, goods WHERE favourites.ms_goods_id = goods.ms_goods_id`;
    const users_info_result = await init_db_operation(
      sql_select_user_info,
      null,
      true
    );
    const favourites_result = await init_db_operation(
      sql_select_favourites,
      null,
      true
    );
    return { users_info_result, favourites_result };
  } catch (err) {
    console.log('get_bot_user_info', err);
  }
};

exports.get_last_time = async () => {
  try {
    const sql_select = `SELECT date FROM exchange_rate`;
    return await init_db_operation(sql_select);
  } catch (err) {
    console.log('get_last_time', err);
  }
};

exports.get_prev_position = async user_id => {
  try {
    const sql_select = `SELECT current_position FROM users WHERE user_id = ?`;
    return await init_db_operation(sql_select, user_id)
  } catch (err) {
    console.log('get_prev_position', err);
  }
};

exports.get_cart_message_id = async (user_id, second) => {
  try {
    const sql_select = `SELECT ${ second ? 'sum_message_id' : 'edit_message_id' } FROM users WHERE user_id = ?`;
    return await init_db_operation(sql_select, user_id);
  } catch (err) {
    console.log('get_cart_message_id', err);
  }
};

exports.set_cart_message_id = async (user_id, message_id, second) => {
  try {
    const sql_update = `UPDATE \`users\` SET ${ second ? "sum_message_id" : "edit_message_id" } = ? WHERE user_id = ?`;
    return await init_db_operation(sql_update, [message_id, user_id]);
  } catch (err) {
    console.log('set_cart_message_id', err);
  }
};

exports.get_current_key = async (user_id) => {
  try {
    const sql_select = `SELECT current_key FROM users WHERE user_id = ?`;
    return await init_db_operation(sql_select, user_id);
  } catch (err) {
    console.log('get_current_key', err);
  }
};

exports.set_current_key = async (user_id, current_key) => {
  try {
    const sql_update = `UPDATE \`users\` SET current_key = ? WHERE user_id = ?`;
    return await init_db_operation(sql_update, [current_key, user_id]);
  } catch (err) {
    console.log('set_current_key', err);
  }
};

const stringify_category_brand = (full_input) => {
  try {
    let category_count = full_input.length / 2;
    let current_index = 0;
    let new_input = [];
    Array.isArray(full_input)
      ? full_input.forEach((_, i, self) => {
          if (!category_count) return;
          if (i % 2 == 0) return;
          const new_array_input = self.slice(current_index, current_index + 2);
          const new_concat = category_brand_concat(new_array_input);
          new_input.push(...new_concat);
          current_index += 2;
          category_count--;
        })
      : null;
    return new_input;
  } catch (err) {
    console.log('stringify_category_brand', err);
  }
};

const category_brand_concat = (input) => {
  try {
    let format_input = [];
    input[0].forEach((category_name) => {
      input[1].forEach((brand_name) => {
        format_input = [...format_input, `${category_name}__${brand_name}`];
      });
    });
    return format_input;
  } catch (err) {
    console.log('category_brand_concat', err);
  }
};
//const filter = ['categories', 'brands', 'budget', 'memory'];
exports.new_query = async (user_id, input, force) => {
  try {
    input = input.trim();
    if (input) {
      await save_inline_query(input, user_id);
      await save_type_inline_mode('category', user_id);
    }
    let sql_update = `UPDATE \`users\` SET ${ force ? 'selected_budget = NULL, ' : ''} selected_many = NULL, selected_color = NULL, selected_mem = NULL WHERE user_id = ?`;
    await init_db_operation(sql_update, user_id);
    let color;
    let memory;
    const input_array = input.split(' ');
    if (input.includes(filter[3])) {
      const color_index = input_array.findIndex((el) => el == filter[3]);
      color = input_array[color_index + 1];
      input_array.splice(color_index, 2);
    }
    if (input.includes(filter[4])) {
      const memory_index = input_array.findIndex((el) => el == filter[4]);
      memory = input_array[memory_index + 1];
      input_array.splice(memory_index, 2);
    }
    input = input_array.join(' ');
    let chunk = '';

    chunk += color ? `, selected_color = '${color}'` : '';
    chunk += memory ? `, selected_mem = ${memory}` : '';

    if (
      input.includes(filter[0]) &&
      input.includes(filter[1]) &&
      !input.includes(filter[2])
    ) {
      const new_input = input
        .split('  ')
        .map((input_element) => input_element.split(' ').slice(1));
      const format_input_result = stringify_category_brand(new_input);
      sql_update = `UPDATE \`users\` SET selected_many = '${format_input_result.join(' ')}' ${chunk} WHERE user_id = ?`;
      //
    } else if (input.includes(filter[2])) {
      if (
        !input.includes(filter[0]) &&
        !input.includes(filter[0]) &&
        !input.includes(filter[1])
      ) {
        const budget_index = input
          .split(' ')
          .findIndex((element) => !isNaN(element));
        const budget = input.split(' ')[budget_index];
        sql_update = `UPDATE \`users\` SET selected_budget = ${budget} ${chunk} WHERE user_id = ?`;
      } else {
        const input_array = input.split('  ');
        const budget = input_array.pop().split(" ").pop();
        const new_input = input_array.map((input_element) =>
          input_element.split(" ").slice(1)
        );
        const format_input_result = stringify_category_brand(new_input);
        sql_update = `UPDATE \`users\` SET selected_many = '${format_input_result.join(' ')}', selected_budget = ${budget} ${chunk} WHERE user_id = ?`;
      }
    }
    return await init_db_operation(sql_update, user_id);
  } catch (err) {
    console.log('new_query', err);
  }
};

const save_inline_query = async (input, user_id) => {
  try {
    const sql_update = `UPDATE \`users\` SET inline_query = '${input}' WHERE user_id = ?`;
    return await init_db_operation(sql_update, user_id);
  } catch (err) {
    console.log('save_inline_query', err);
  }
};

const save_type_inline_mode = async (type, user_id) => {
  try {
    const sql_update = `UPDATE \`users\` SET type_inline_mode = '${type}' WHERE user_id = ?`;
    return await init_db_operation(sql_update, user_id);
  } catch (err) {
    console.log('save_type_inline_mode', err);
  }
};

exports.get_type_inline_mode = async (user_id) => {
  try {
    const sql_update = `SELECT type_inline_mode FROM users WHERE user_id = ?`;
    return await init_db_operation(sql_update, user_id);
  } catch (err) {
    console.log('get_type_inline_mode', err);
  }
};

const find_status = async (input_array) => {
  try {
    const all_status = await get_status_from();
    const all_status_array = all_status.map((obj) =>
      Object.values(obj).map((status_element) => status_element.toLowerCase())
    );
    let selected_status_name;
    input_array.forEach((input_array_element, index) => {
      all_status_array.forEach((status_array) => {
        if (status_array.join(" ").includes(input_array_element.toLowerCase()))
          selected_status_name = [status_array[0], index];
      });
    });
    Array.isArray(input_array) && selected_status_name
      ? input_array.splice(selected_status_name[1], 1)
      : null;
    return selected_status_name ? selected_status_name[0] : null;
  } catch (err) {
    console.log('find_status', err);
  }
};

const find_brand = async (input_array) => {
  try {
    const brands = await get_brand_for_smart_search();
    const brands_name = brands
      .map((brand_obj) =>
        Object.values(brand_obj).map((brand_name) => brand_name.toLowerCase())
      )
      .flat();
    let selected_brand_name;
    input_array.forEach((input_array_element, index) => {
      brands_name.forEach((brand_name) => {
        if (brand_name.includes(input_array_element)) {
          selected_brand_name = [brand_name, index];
        }
      });
    });
    Array.isArray(input_array) && selected_brand_name
      ? input_array.splice(selected_brand_name[1], 1)
      : null;    
    return selected_brand_name ? selected_brand_name[0] : null;
  } catch (err) {
    console.log("find_brand", err);
  }
};

const find_category = async (input_array) => {
  try {
    const categories = await get_category_for_smart_search();
    const categories_array = categories
      .map((obj) =>
        Object.values(obj).map((category_element) =>
          category_element.toLowerCase()
        )
      )
      .filter((e) => !e.some((el) => el.includes('accessories') || el.includes('aksesuari')));
    let selected_category_name;
    input_array.forEach((input_array_element, index) => {
      if (input_array_element.length <= 3) return;
      categories_array.forEach((category_array) => {
        if (category_array.join(' ').includes(input_array_element))
          selected_category_name = [category_array[0], index];
      });
    });
    Array.isArray(input_array) && selected_category_name
      ? input_array.splice(selected_category_name[1], 1)
      : null;
    return selected_category_name
      ? selected_category_name[0]
      : selected_category_name;
  } catch (err) {
    console.log('find_category', err);
  }
};

exports.set_smart_state = async (input, user_id) => {
  try {
    let sql_inserts = [];
    if (input) {
      let to_filter = [];
      input = input.trim();
      if (input) {
        await save_inline_query(input, user_id);
        await save_type_inline_mode('smart_search', user_id);
      }
      input.split(' ').forEach((input_element, index) => {
        if (!isNaN(parseInt(input_element))) {
          if (input_element > 12) {
            if (!input_element.search(/\d{4}/) && input_element < 2030) {
              const sql_insert = `UPDATE \`users\` SET selected_date = '${input_element}' WHERE user_id = ?`;
              sql_inserts.push(sql_insert);
            } else if (
              ((input_element & -input_element) == input_element &&
                input_element > 0) ||
              input_element <= 6
            ) {
              const sql_insert = `UPDATE \`users\` SET selected_memory = ${input_element} WHERE user_id = ?`;
              sql_inserts.push(sql_insert);
            } else {
              const sql_insert = `UPDATE \`users\` SET selected_number = '${input_element}' WHERE user_id = ?`;
              sql_inserts.push(sql_insert);
            }
          } else if (input_element.includes('"')) {
            const sql_insert = `UPDATE \`users\` SET selected_diagonal = '${input_element}' WHERE user_id = ?`;
            sql_inserts.push(sql_insert);
          } else if (input_element.includes("/")) {
            const ram_rom = input_element.split("/").join(" ");
            const sql_insert = `UPDATE \`users\` SET selected_memory = '${ram_rom}' WHERE user_id = ?`;
            sql_inserts.push(sql_insert);
          } else if (
            input_element.includes('gb') ||
            input_element.includes('гб') ||
            input_element.includes('Гб') ||
            input_element.includes('Gb') ||
            input_element.includes('GB')
          ) {
            const memory = input_element
              .trim()
              .split('')
              .filter((element) => element.search(/[0-9]/) != -1)
              .join('');
            const sql_insert = `UPDATE \`users\` SET selected_memory = '${memory}' WHERE user_id = ?`;
            sql_inserts.push(sql_insert);
          } else {
            const sql_insert = `UPDATE \`users\` SET selected_number = '${input_element}' WHERE user_id = ?`;
            sql_inserts.push(sql_insert);
          }
          to_filter.push(input_element);
        } else if (
          input_element.includes('б/у') ||
          input_element.includes('бу') ||
          input_element.includes('бу')
        ) {
          const sql_insert = `UPDATE \`users\` SET selected_status = 'used' WHERE user_id = ?`;
          sql_inserts.push(sql_insert);
        }
      });
      let sql_insert;
      let input_array = input
        .split(' ')
        .filter(
          (element) =>
            element &&
            !element.includes('б/у') &&
            !element.includes('бу') &&
            !element.includes('б\\у')
        );

      to_filter.forEach((filter_element) => {
        input_array = input_array.filter((input) => input != filter_element);
      });

      const status = await find_status(input_array);
      sql_insert = `UPDATE \`users\` SET selected_status = '${status}' WHERE user_id = ?`;
      status ? sql_inserts.push(sql_insert) : null;

      const brand = await find_brand(input_array);
      sql_insert = `UPDATE \`users\` SET selected_brand = '${brand}' WHERE user_id = ?`;
      brand ? sql_inserts.push(sql_insert) : null;

      const category = await find_category(input_array);
      sql_insert = `UPDATE \`users\` SET selected_category = '${category}' WHERE user_id = ?`;
      category ? sql_inserts.push(sql_insert) : null;

      const new_input = input_array.join(" ");
      sql_insert = `UPDATE \`users\` SET selected_text = '${new_input}' WHERE user_id = ?`;
      new_input != "" ? sql_inserts.push(sql_insert) : null;
      console.log(sql_inserts);
      await Promise.all(
        sql_inserts.map((sql_insert) => init_db_operation(sql_insert, user_id))
      );
    }
  } catch (err) {
    console.log('set_smart_state', err);
  }
};

exports.clear_state = async (user_id) => {
  try {
    const sql_clear = `UPDATE \`users\` SET 
      selected_category = NULL, 
      selected_brand = NULL, 
      selected_budget = NULL, 
      selected_many = NULL, 
      selected_memory = NULL, 
      selected_diagonal = NULL,
      selected_text = NULL,
      selected_date = NULL,
      selected_number = NULL,
      selected_status = NULL
      WHERE user_id = ?`;
    return await init_db_operation(sql_clear, user_id);
  } catch (err) {
    console.log('clear_state', err);
  }
};

exports.set_invoice_id = async (user_id, current_invoice_id) => {
  try {
    const sql_update = `UPDATE \`users\` SET invoice_id = '${current_invoice_id}' WHERE user_id = ?`;
    return await init_db_operation(sql_update, user_id);
  } catch (err) {
    console.log('set_invoice_id', err);
  }
};

exports.get_invoice_id = async (user_id) => {
  try {
    const sql_select = 'SELECT invoice_id FROM users WHERE user_id = ?';
    return await init_db_operation(sql_select, user_id);
  } catch (err) {
    console.log('get_invoice_id', err);
  }
};

const set_current_exchange_rate = async (current_exchange_rate) => {
  try {
    const time = new Date().toLocaleString({ timeZone: 'Europe/Kiev' });
    const result = await get_current_exchange_rate();
    let sql;
    if (!result) {
      sql = `INSERT INTO \`store\`.\`exchange_rate\` (current_exchange_rate, date) VALUES (${current_exchange_rate}, ${time})`;
    } else {
      sql = `UPDATE \`exchange_rate\` SET current_exchange_rate = '${current_exchange_rate}', date = '${time}'`;
    }
    return await init_db_operation(sql);
  } catch (err) {
    console.log('set_current_exchange_rate', err);
  }
};

const get_current_exchange_rate = async () => {
  try {
    const sql_select = 'SELECT current_exchange_rate, date FROM exchange_rate';
    return await init_db_operation(sql_select);
  } catch (err) {
    console.log('get_current_exchange_rate', err);
  }
};

exports.exchange_rate_analysis = async (user_id) => {
  try {
    const time_now = new Date().toLocaleString({ timeZone: "Europe/Kiev" });
    const { current_exchange_rate, date } = await get_current_exchange_rate();
    if (
      new Date(time_now).getDay() - new Date(date).getDay() ||
      !current_exchange_rate
    ) {
      const today_exchange_rates = await exchange_rates();
      await set_current_exchange_rate(today_exchange_rates);
      return today_exchange_rates;
    }
    return current_exchange_rate;
  } catch (err) {
    console.log('exchange_rate_analysis', err);
  }
};

exports.first_action_mailing_execute = async () => {
  try {
    const sql_update = `UPDATE \`active_mailing\` SET status = ?`;
    return await init_db_operation(sql_update, true);
  } catch (err) {
    console.log('first_action_mailing_execute', err);
  }
};

exports.check_first_action_mailing_execute = async () => {
  try {
    const sql_select = 'SELECT status FROM active_mailing';
    return await init_db_operation(sql_select);
  } catch (err) {
    console.log('check_first_action_mailing_execute', err);
  }
};

exports.clear_first_action_mailing_execute = async () => {
  try {
    const sql_update = `UPDATE \`active_mailing\` SET status = NULL `;
    return await init_db_operation(sql_update);
  } catch (err) {
    console.log('clear_first_action_mailing_execute', err);
  }
};

exports.change_time = async (time_type, value) => {
  try {
    const sql_update = `UPDATE \`active_mailing\` SET ${time_type} = ${parseInt(value)} `;
    return await init_db_operation(sql_update);
  } catch (err) {
    console.log('change_time', err);
  }
};

exports.get_time_mailing = async (time_type) => {
  try {
    const sql_select = `SELECT ${time_type} FROM active_mailing WHERE id = ?`;
    return await init_db_operation(sql_select, 1);
  } catch (err) {
    console.log('get_time_mailing', err);
  }
};

exports.set_mailing_goods_ref = async (user_id, mailing_goods_ref) => {
  try {
    const sql_update = `UPDATE \`users\` SET mailing_goods_ref = '${mailing_goods_ref}' WHERE user_id = ?`;
    return await init_db_operation(sql_update, user_id);
  } catch (err) {
    console.log('set_mailing_goods_ref', err);
  }
};

exports.get_mailing_goods_ref = async (user_id) => {
  try {
    const sql_select = 'SELECT mailing_goods_ref FROM users WHERE user_id = ?';
    return await init_db_operation(sql_select, user_id);
  } catch (err) {
    console.log('get_mailing_goods_ref', err);
  }
};

exports.save_inline_message_id = async (user_id, message_id) => {
  try {
    const sql_update = `UPDATE \`users\` SET inline_message_id = '${message_id}' WHERE user_id = ?`;
    return await init_db_operation(sql_update, user_id);
  } catch (err) {
    console.log('set_mailing_goods_ref', err);
  }
};

exports.get_inline_message_id = async (user_id) => {
  try {
    const sql_select = 'SELECT inline_message_id FROM users WHERE user_id = ?';
    const result = await init_db_operation(sql_select, user_id);
    const sql_update = `UPDATE \`users\` SET inline_message_id = '0' WHERE user_id = ?`;
    await init_db_operation(sql_update, user_id);
    return result;
  } catch (err) {
    console.log('get_mailing_goods_ref', err);
  }
};
