'use strict';
const { init_db_operation } = require('../../db/db');
const { delete_from } = require('../db/delete/delete_from');

exports.mailing_feedback = async (mailing_id, count) => {
  try {
    await get_insert_mailing_count_users(mailing_id, count);
    await get_insert_mailing_status(mailing_id, 'Done');
  } catch (err) {
    console.log('mailing_feedback', err);
  }
};

exports.get_insert_mailing_info = async (data) => {
  try {
    if (!data || !data.length) return;
    await delete_from('mailing');
    data = data.filter((e) => e[0]);
    const sql_insert =
      "INSERT INTO `mailing` (`mailing_sheet_id`, `mailing_type`, `crater_filter`, `message`, `date`, `additional`, `status`) VALUES (?, ?, ?, ?, ?, ?, ?)";
    for (const data_element of data) {
      const insert_data = [
        data_element[0],
        data_element[1] ? data_element[1] : '',
        data_element[2],
        data_element[4],
        data_element[5],
        data_element[6],
        data_element[9],
      ];
      await init_db_operation(sql_insert, insert_data);
    }
  } catch (err) {
    console.log('get_insert_mailing_info', err);
  }
};

exports.delete_mailing_info = async (mailing_sheet_id) => {
  try {
    const sql_delete = 'DELETE FROM `mailing` WHERE mailing_sheet_id = ?';
    return await init_db_operation(sql_delete, mailing_sheet_id);
  } catch (err) {
    console.log('delete_mailing_info', err);
  }
};

const get_insert_mailing_count_users = async (mail_id, count) => {
  try {
    const sql_update = `UPDATE \`mailing\` SET users_count = ? WHERE id = ?`;
    return await init_db_operation(sql_update, [count, mail_id]);
  } catch (err) {
    console.log('get_insert_mailing_count_users', err);
  }
};

exports.set_update_mailing_conversion_users = async (mail_id = 1) => {
  try {
    const sql_update = `UPDATE \`mailing\` SET \`conversion_users\` = \`conversion_users\` + 1 WHERE id = ?`;
    return await init_db_operation(sql_update, mail_id);
  } catch (err) {
    console.log('set_update_mailing_conversion_users', err);
  }
};

const get_insert_mailing_status = async (mail_id, status) => {
  try {
    const sql_update = `UPDATE \`mailing\` SET status = ? WHERE id = ?`;
    return await init_db_operation(sql_update, [status, mail_id]);
  } catch (err) {
    console.log('get_insert_mailing_status', err);
  }
};

exports.get_mailing = async () => {
  try {
    const sql_select = `SELECT * FROM mailing WHERE status = ? AND view IS NULL`;
    return await init_db_operation(sql_select, 'Pending', true);
  } catch (err) {
    console.log('get_mailing', err);
  }
};

exports.get_done_mailing = async () => {
  try {
    const sql_select = `SELECT * FROM mailing WHERE status = ?`;
    return await init_db_operation(sql_select, "Done", true);
  } catch (err) {
    console.log('get_mailing', err);
  }
};

exports.change_view_status = async () => {
  try {
    const sql_update = `UPDATE \`mailing\` SET view = ?, status = ?`;
    return await init_db_operation(sql_update, [true, 'Processing']);
  } catch (err) {
    console.log('change_view', err);
  }
};
