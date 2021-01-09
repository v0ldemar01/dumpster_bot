'use strict';
const { delete_from } = require('../db/delete/delete_from');
const { init_db_operation } = require('../../db/db');

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

exports.set_question_text = async (user_id, question) => {
  try {
    const sql_insert = `INSERT INTO \`answer_questions\` (user_id, question) VALUES (?, ?)`;
    return await init_db_operation(sql_insert, [user_id, question]);
  } catch (err) {
    console.log('set_question_text', err);
  }
};

exports.get_questions_by_user = async (user_id) => {
  try {
    const sql_select = `SELECT * FROM answer_questions WHERE user_id = ?`;
    return await init_db_operation(sql_select, user_id, true);
  } catch (err) {
    console.log('get_questions_by_user', err);
  }
};

const get_all_questions_local = async () => {
  try {
    const sql_select = `SELECT * FROM answer_questions`;
    return await init_db_operation(sql_select, null, true);
  } catch (err) {
    console.log('all_questions', err);
  }
};

exports.get_all_questions = async () => await get_all_questions_local();

exports.get_insert_answer_questions = async (result) => {
  try {
    const prev_questions = await get_all_questions_local();
    const new_result = result.filter(({ code }) =>
      prev_questions.some((question) => !question.code == code)
    );
    if (new_result && new_result.length) {
      const result_sql = result.map(
        result_element =>
          `INSERT INTO \`answer_questions\` (${ Object.keys(result_element).join(', ') + ', is_solved' })` 
          + ` VALUES ` + 
          `(${ Array(Object.values(result_element).length).fill('?').join(', ') + ', ?' })`
      );
      for (let i = 0; i < result_sql.length; i++) {
        await init_db_operation(result_sql[i], [
          ...Object.values(result[i]),
          true,
        ]);
      }
      //await Promise.allSettled(result_sql.map((sql_insert, i) => init_db_operation(sql_insert, [...Object.values(result[i]), true])));
    }
  } catch (err) {
    console.log('get_insert_answer_questions', err);
  }
};

exports.get_answer_questions = async () => {
  try {
    const sql_select = `SELECT * FROM answer_questions WHERE is_solved = '1'`;
    return await init_db_operation(sql_select, null, true);
  } catch (err) {
    console.log('get_questions_by_user', err);
  }
};

exports.get_answer_questions_by_user = async (user_id) => {
  try {
    const sql_select = `SELECT * FROM answer_questions WHERE is_solved = 'true' AND user_id = ?`;
    return await init_db_operation(sql_select, user_id, true);
  } catch (err) {
    console.log('get_questions_by_user', err);
  }
};

exports.change_count_click = async (language, number) => {
  try {
    const sql_update = `UPDATE \`answer_questions\` SET \`count\` = \`count\` + 1 WHERE code LIKE '%${language}%' AND number = ${number}`;

    return await init_db_operation(sql_update);
  } catch (err) {
    console.log('change_count_click', err);
  }
};
