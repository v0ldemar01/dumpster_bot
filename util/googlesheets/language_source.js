'use strict'
const fs = require('fs').promises;
const {
  init_action,
  update_sheet_date,
  SHEET1_NAME_TEXT,
} = require('./googlesheets');
const { makeRangeIterator } = require('./iterator');
const { check_columns_crater_info } = require('../state/statistics');

const get_language_source = (number_range, sheet, language_array) => {
  try {
    let cell_current_codes = [];
    let char;
    const result_array = language_array.map((language, index) => {
      const it = makeRangeIterator(...number_range);
      let result = it.next();
      const cell_values = [];
      const cell_codes = [];
      if (language == 'uk') {
        char = 'C';
      } else {
        char = 'D';
      }
      while (!result.done) {
        cell_codes.push(
          sheet.getCellByA1(`A${result.value}`)._rawData.formattedValue
        );
        cell_values.push(
          sheet.getCellByA1(`${char}${result.value}`)._rawData.formattedValue
        );
        result = it.next();
      }
      const language_result_obj = {};
      let current_index = 0;
      cell_values.forEach((cell_value, index) => {
        if (cell_codes[index] == "" || cell_codes[index]?.includes('crater'))
          return current_index++;
        const current_cell_code = cell_codes[current_index]?.split('.');
        current_cell_code
          ? ifExistsObj(language_result_obj, current_cell_code, cell_value)
          : null;
        current_index++;
      });
      index ? (cell_current_codes = cell_codes) : null;
      return language_result_obj;
    });
    const format_cell_codes = cell_current_codes.filter(
      (e) => e && e.search(/\w/) != -1 && e.search(/\d/) == -1
    );
    result_array.push(format_cell_codes);
    return result_array;
  } catch (err) {
    console.log('get_language_source', err);
  }
};

const ifExistsObj = (obj, name_code, value) => {
  try {
    if (name_code.length == 1) {
      obj[`${name_code.shift()}`] = value;
      return;
    }
    const current_code = name_code.shift();
    if (!obj[`${current_code}`]) obj[`${current_code}`] = {};
    return ifExistsObj(obj[`${current_code}`], name_code, value);
  } catch (err) {
    console.log('ifExistsObj', err);
  }
};

const getDataFromSheetText = async () => {
  try {
    const sheet_name = SHEET1_NAME_TEXT;
    const { sheet, number_range } = await init_action(1, sheet_name, 4, 'A:D');
    await update_sheet_date(sheet_name);
    return get_language_source(number_range, sheet, ['uk', 'ru']);
  } catch (err) {
    console.log('getDataFromSheetText', err);
  }
};

exports.init_language_source = async () => {
  try {
    const [uk_language, ru_language, cell_codes] = await getDataFromSheetText();
    await fs.writeFile('./locales/ua.json', JSON.stringify(uk_language));
    await fs.writeFile('./locales/ru.json', JSON.stringify(ru_language));
    //await update_crater_info(cell_codes);
    console.log('complete language_source');
  } catch (error) {
    console.log("init_language_source", error);
  }
};

const update_crater_info = async (cell_codes) => {
  try {
    //await check_columns_crater_info(cell_codes);
  } catch (err) {
    console.log('update_crater_info', err);
  }
};
