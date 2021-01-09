'use strict';
const { init_db_operation } = require('../../db/db');

exports.init_used_words = (ctx) => {
  try {
    const used_words = {};
    used_words[ctx.i18n.t('smart_search.select_category')] =
      'selected_category';
    used_words[ctx.i18n.t('smart_search.select_brand')] = 'selected_many';
    used_words[ctx.i18n.t('budget.selecting_filter')] = 'selected_many';
    return used_words;
  } catch (err) {
    console.log('init_used_words', err);
  }
};

exports.initial_state = async (user_id, username, first_name) => {
  try {
    let new_user = false;
    const sql_select = `SELECT * FROM users WHERE user_id = ?`;
    const sql_delete = `DELETE FROM users WHERE user_id = ?`;
    const sql_insert = `INSERT INTO \`users\` (user_id, username, name) VALUES (?, ?, ?)`;

    const result = await init_db_operation(sql_select, user_id);
    if (!result) {
      new_user = true;
    } else {
      await init_db_operation(sql_delete, user_id);
    }
    await init_db_operation(sql_insert, [user_id, username, first_name]);

    return new_user;
  } catch (err) {
    console.log('initial_state', err);
  }
};

exports.initial_state_invoice = async (user_id) => {
  try {
    const sql_insert = `INSERT INTO \`invoice\` (user_id) VALUES (?)`;
    const { insertId } = await init_db_operation(sql_insert, user_id, true);
    return insertId;
  } catch (err) {
    console.log('initial_state_invoice', err);
  }
};

exports.initial_state_statistics = async () => {
  try {
    const sql_select = `SELECT * FROM statistics`;
    const sql_insert = `INSERT INTO \`statistics\` (id) VALUES (?)`;

    const result = await init_db_operation(sql_select);
    if (!result) {
      await init_db_operation(sql_insert, 1);
    }
  } catch (err) {
    console.log('initial_state_statistics', err);
  }
};

exports.initial_state_mailing = async () => {
  try {
    const sql_select = `SELECT * FROM active_mailing`;
    const sql_insert = `INSERT INTO \`active_mailing\` (id) VALUES (?)`;

    const result = await init_db_operation(sql_select);
    if (!result) {
      await init_db_operation(sql_insert, 1);
    }
  } catch (err) {
    console.log('initial_state_mailing', err);
  }
};

exports.initial_state_exchange_rate = async () => {
  try {
    const sql_select = `SELECT * FROM exchange_rate`;
    const sql_insert = `INSERT INTO \`exchange_rate\` (id) VALUES (?)`;

    const result = await init_db_operation(sql_select);
    if (!result) {
      await init_db_operation(sql_insert, 1);
    }
  } catch (err) {
    console.log('initial_state_exchange_rate', err);
  }
};
