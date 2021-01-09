'use strict';
const { init_db_operation } = require('../../db/db');

exports.get_all_users = async () => {
  try {
    const sql_select = 'SELECT * FROM users';
    return await init_db_operation(sql_select, null, true);
  } catch (err) {
    console.log('get_all_users', err);
  }
};

const select_favourites = async (user_id, id) => {
  try {
    const sql_select =
      'SELECT * FROM favourites WHERE user_id = ? AND ms_goods_id = ?';
    return await init_db_operation(sql_select, [user_id, id]);
  } catch (err) {
    console.log('select_favourites', err);
  }
};

exports.select_all_favourites = async (user_id) => {
  try {
    const sql_select =
      'SELECT * FROM favourites JOIN goods ON favourites.ms_goods_id = goods.ms_goods_id WHERE user_id = ?';
    return await init_db_operation(sql_select, user_id, true);
  } catch (err) {
    console.log('select_all_favourites', err);
  }
};

exports.select_all_goods_by_ms_id = async (ms_goods_ids) => {
  try {
    const sql_select = 'SELECT * FROM goods WHERE ms_goods_id = ?';
    const result = [];
    for (const ms_goods_id of ms_goods_ids) {
      try {
        const current_result = await init_db_operation(
          sql_select,
          ms_goods_id,
          true
        );
        result.push(current_result);
      } catch (err) {
        console.log(err);
      }
    }
    return result;
  } catch (err) {
    console.log('select_all_goods_by_ms_id', err);
  }
};

const insert_favourites = async (user_id, id) => {
  try {
    const sql_select = `SELECT price FROM goods WHERE ms_goods_id = ?`;
    const { price } = await init_db_operation(sql_select, id);
    const sql_insert = `INSERT INTO \`favourites\` (user_id, ms_goods_id, prev_price) VALUES (?, ?, ?)`;
    return await init_db_operation(sql_insert, [user_id, id, price]);
  } catch (err) {
    console.log('insert_favourites', err);
  }
};

const delete_favourites = async (user_id, id) => {
  try {
    const sql_delete = `DELETE FROM favourites WHERE user_id = ? AND ms_goods_id = ?`;
    return await init_db_operation(sql_delete, [user_id, id]);
  } catch (err) {
    console.log('delete_favourites', err);
  }
};

exports.toggle_favourites = async (user_id, ms_goods_id) => {
  try {    
    const favourite = await select_favourites(user_id, ms_goods_id);
    if (favourite) {
      await delete_favourites(user_id, ms_goods_id);
      return false;
    } else {
      await insert_favourites(user_id, ms_goods_id);
      return true;
    }
  } catch (err) {
    console.log('toggle_favourites', err);
  }
};

const select_goods_in_cart = async (user_id, id) => {
  try {
    const sql_select =
      'SELECT * FROM cart WHERE user_id = ? AND ms_goods_id = ?';
    return await init_db_operation(sql_select, [user_id, id]);
  } catch (err) {
    console.log('select_goods_in_cart', err);
  }
};

const insert_goods_in_cart = async (user_id, id) => {
  try {
    const sql_insert = `INSERT INTO \`cart\` (user_id, ms_goods_id, count) VALUES (?, ?, 1)`;
    return await init_db_operation(sql_insert, [user_id, id]);
  } catch (err) {
    console.log('insert_goods_in_cart', err);
  }
};

const delete_goods_in_cart = async (user_id, id) => {
  try {
    const sql_delete = id
      ? `DELETE FROM cart WHERE user_id = ? AND ms_goods_id = '${id}'`
      : `DELETE FROM cart WHERE user_id = ?`;
    return await init_db_operation(sql_delete, user_id);
  } catch (err) {
    console.log('delete_goods_in_cart', err);
  }
};

exports.clear_user_cart = async (user_id) =>
  await delete_goods_in_cart(user_id);

exports.toggle_goods_in_cart = async (user_id, ms_goods_id, price, force) => {
  try {
    const is_in_cart = await select_goods_in_cart(user_id, ms_goods_id);
    if (force) {
      await delete_goods_in_cart(user_id, ms_goods_id);
      return false;
    }
    if (is_in_cart) {
      await delete_goods_in_cart(user_id, ms_goods_id);
      return false;
    } else {
      await insert_goods_in_cart(user_id, ms_goods_id, price);
      return true;
    }
  } catch (err) {
    console.log('toggle_goods_in_cart', err);
  }
};

exports.set_result_id = async (user_id, result_id) => {
  try {
    const sql_insert = `UPDATE \`users\` SET result_id = ? WHERE user_id = ?`;
    return await init_db_operation(sql_insert, [result_id, user_id]);
  } catch (err) {
    console.log('set_result_id', err);
  }
};

exports.get_result_id = async (user_id) => {
  try {
    const sql_insert = `SELECT result_id FROM users WHERE user_id = ?`;
    return await init_db_operation(sql_insert, user_id);
  } catch (err) {
    console.log('get_result_id', err);
  }
}; //

exports.set_offset = async (user_id, offset) => {
  try {
    const sql_insert = `UPDATE \`users\` SET offset = ? WHERE user_id = ?`;
    return await init_db_operation(sql_insert, [offset, user_id]);
  } catch (err) {
    console.log('set_offset', err);
  }
};

exports.get_offset = async (user_id) => {
  try {
    const sql_insert = `SELECT offset FROM users WHERE user_id = ?`;
    return await init_db_operation(sql_insert, user_id);
  } catch (err) {
    console.log('get_offset', err);
  }
};

exports.get_results_id = async (user_id, tables = "favourites") => {
  try {
    const sql_select = `SELECT ms_goods_id FROM ${tables} WHERE user_id = ?`;
    return await init_db_operation(sql_select, user_id, true);
  } catch (err) {
    console.log('get_results_id', err);
  }
};

exports.get_count_of_goods_at_cart = async (user_id) => {
  try {
    const sql_select = `SELECT ms_goods_id, count FROM cart WHERE user_id = ?`;
    return await init_db_operation(sql_select, user_id, true);
  } catch (err) {
    console.log('get_count_of_goods_at_cart', err);
  }
};

const set_count_of_goods_at_cart = async (user_id, id, count) => {
  try {
    const sql_update = `UPDATE \`cart\` SET count = ${count} WHERE user_id = ? AND ms_goods_id = ?`;
    return await init_db_operation(sql_update, [user_id, id]);
  } catch (err) {
    console.log('set_count_of_goods_at_cart', err);
  }
};

exports.change_count_of_goods_in_cart = async (user_id, ms_goods_id, count) => {
  try {
    const is_in_cart = await select_goods_in_cart(user_id, ms_goods_id);
    if (is_in_cart) {
      const prev_count = is_in_cart.count;
      if (prev_count == 1 && count == -1) return true;
      await set_count_of_goods_at_cart(user_id, ms_goods_id, prev_count + count);
    }
  } catch (err) {
    console.log('change_count_of_goods_in_cart', err);
  }
};

exports.select_all_goods_in_cart = async (user_id) => {
  try {
    const sql_select =
      'SELECT gd.name, gd.ms_goods_id, gd.price, cart.count FROM cart JOIN goods AS gd ON cart.ms_goods_id = gd.ms_goods_id WHERE cart.user_id = ?';
    return await init_db_operation(sql_select, user_id, true);
  } catch (err) {
    console.log('select_all_goods_in_cart', err);
  }
};

exports.get_goods_info_by_id = async (ms_goods_id) => {
  try {
    const sql_select = 'SELECT name, price FROM goods WHERE ms_goods_id = ?';
    return await init_db_operation(sql_select, ms_goods_id);
  } catch (err) {
    console.log('select_all_goods_in_cart', err);
  }
};

exports.find_favourites = async (selected_category, selected_brand) => {
  try {
    const sql_select =
      `SELECT DISTINCT user_id FROM favourites WHERE ms_goods_id IN` +
      `(SELECT ms_goods_id FROM goods WHERE category_brand_id IN ` +
      `(SELECT id FROM categories_brands WHERE category_id IN ` +
      `(SELECT id FROM categories WHERE category_name = ?) ` +
      `AND brand_id IN (SELECT id FROM brands WHERE brand_name = ?)))`;
    return await init_db_operation(
      sql_select,
      [selected_category, selected_brand],
      true
    );
  } catch (err) {
    console.log('find_favourites', err);
  }
};
