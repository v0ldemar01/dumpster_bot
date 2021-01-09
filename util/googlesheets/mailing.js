'use strict';
const {
  init_action,
  update_sheet_date,
  SHEET1_NAME_MAILING_HISTORY,
  SHEET1_NAME_MAILING,
} = require('./googlesheets');
const { generate_range } = require('./generate_range');
const { makeRangeIterator } = require('./iterator');
const { get_done_mailing } = require('../state/mailing');

exports.get_mailing_info = async () => {
  try {
    const char_range = 'A:J';
    const sheet_name = SHEET1_NAME_MAILING_HISTORY;
    console.log(SHEET1_NAME_MAILING_HISTORY);
    const { sheet, number_range } = await init_action(
      1,
      sheet_name,
      3,
      char_range
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
        row.push(value);
      });
      const check = row.some(
        (element) => element && element.includes('Pending')
      );
      if (check) cell_values.push(row);
      result = it.next();
    }
    cell_values && cell_values.length
      ? await change_mailing_status(sheet)
      : null;
    await change_users_info(sheet);
    return cell_values;
  } catch (err) {
    console.log('get_mailing_info', err);
  }
};

exports.get_mailing_columns = async () => {
  try {
    const char_range = 'B:P';
    const sheet_name = SHEET1_NAME_MAILING;
    const { sheet, number_range } = await init_action(
      1,
      sheet_name,
      2,
      char_range,
      2
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
        value ? row.push(value) : null;
      });
      cell_values.push(...row);
      result = it.next();
    }
    return cell_values;
  } catch (err) {
    console.log('get_mailing_columns', err);
  }
};

const change_mailing_status = async (sheet) => {
  try {
    const it = makeRangeIterator(3, 200);
    let result = it.next();
    let current_coordinate_first;
    let cell_first;
    do {
      current_coordinate_first = `A${result.value}`;
      const current_coordinate_status = `J${result.value}`;
      cell_first = sheet.getCellByA1(current_coordinate_first);
      const cell_status = sheet.getCellByA1(current_coordinate_status);
      if (cell_status._rawData.formattedValue == 'Pending') {
        cell_status.value = 'Processing';
      }
      result = it.next();
    } while (cell_first._rawData.formattedValue);
    await sheet.saveUpdatedCells();
  } catch (err) {
    console.log('change_mailing_status', err);
  }
};

const change_users_info = async (sheet) => {
  try {
    const it = makeRangeIterator(3, 200);
    let result = it.next();
    let current_coordinate;
    let cell;
    const char_coordinates = ['D', 'H', 'I', 'J'];
    const mailing_done_info = await get_done_mailing();
    if (!mailing_done_info || !mailing_done_info.length) return;
    do {
      mailing_done_info.forEach(
        ({ mailing_sheet_id, users_count, conversion_users, status }) => {
          cell = sheet.getCellByA1(`A${result.value}`);
          const cell_value = cell._rawData.formattedValue;
          if (cell_value == mailing_sheet_id) {
            const result_cell_value = [
              users_count,
              conversion_users,
              !users_count ? users_count : conversion_users / users_count,
              status,
            ];
            result_cell_value.forEach((result_value, index) => {
              current_coordinate = `${char_coordinates[index]}${result.value}`;
              let current_cell = sheet.getCellByA1(current_coordinate);
              current_cell.value = result_value;
            });
          }
        }
      );
      result = it.next();
    } while (cell?._rawData?.formattedValue);
    await sheet.saveUpdatedCells();
    console.log('update');
  } catch (err) {
    console.log('change_users_info', err);
  }
};
