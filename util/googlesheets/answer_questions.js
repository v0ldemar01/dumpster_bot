'use strict'
const {
  init_action,
  update_sheet_date,
  SHEET1_NAME_ANSW_QUESTIONS,
} = require('./googlesheets');
const { generate_range } = require('./generate_range');
const { makeRangeIterator } = require('./iterator');
const {
  get_insert_answer_questions,
  get_all_questions,
} = require('../state/questions');

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

const get_answer_questions = async () => {
  try {
    const char_range = 'A:F';
    const sheet_name = SHEET1_NAME_ANSW_QUESTIONS;
    const { sheet, number_range } = await init_action(
      1,
      sheet_name,
      3,
      char_range,
      200
    );
    await update_sheet_date(sheet_name);
    const cell_values = [];
    const { alphabet, it } = generate_range(char_range, number_range);
    let result = it.next();
    while (!result.done) {
      const row = [];
      alphabet.split('').forEach((char) => {
        const value = sheet.getCellByA1(`${char}${result.value}`)._rawData
          .formattedValue;
        row.push(value ? value : '');
      });
      const check = row.some(
        (element) => element && element.includes('question')
      );
      if (check) cell_values.push(row);
      result = it.next();
    }
    return cell_values;
  } catch (err) {
    console.log('get_answer_questions', err);
  }
};

const update_info_answer_questions = async (data) => {
  try {
    const sheet_name = SHEET1_NAME_ANSW_QUESTIONS;
    await update_sheet_date(sheet_name);
    const { sheet, number_range } = await init_action(1, sheet_name, 3, 'A:F');

    const it = makeRangeIterator(...number_range);
    let result = it.next();
    while (!result.done) {
      const current_code = sheet.getCellByA1(`A${result.value}`)._rawData
        .formattedValue;
      if (current_code) {
        const current_code_value = data.filter(
          ({ code }) => code == current_code
        );
        if (current_code_value && current_code_value.length) {
          const current_cell_position = sheet.getCellByA1(`F${result.value}`);
          current_cell_position.value = current_code_value[0].count;
          if (!(result.value % 10)) await sleep(1000);
          await sheet.saveUpdatedCells();
        }
      }
      result = it.next();
    }
    console.log('complete_update_info_answer_questions');
  } catch (err) {
    console.log('update_info_answer_questions', err);
  }
};
exports.current_answer_questions = async () => {
  try {
    const answer_questions_in_array = await get_answer_questions();
    const template_obj = {
      code: '',
      number: 0,
      question: '',
      answer: '',
      url: '',
    };
    const combined_result = answer_questions_in_array.map(
      (answer_questions_element) => {
        const key_value = Object.keys(template_obj).map((key, index) => [
          key,
          answer_questions_element[index],
        ]);
        return Object.fromEntries(key_value);
      }
    );
    const result = await get_all_questions();
    await update_info_answer_questions(result);
    await get_insert_answer_questions(combined_result);
  } catch (err) {
    console.log('current_answer_questions', err);
  }
};
