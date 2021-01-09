'use strict';
const fs = require('fs');
const path =
  global.os == 'win32'
    ? __dirname.split('\\').slice(0, -2).join('\\')
    : __dirname.split('/').slice(0, -2).join('/');
require('dotenv').config({ path: path + '/.env' });
let config = JSON.parse(fs.readFileSync(__dirname + '/sheets_name.json'));

const { GoogleSpreadsheet } = require('google-spreadsheet');

const select_googlesheet_id = (number_sheet_id) => {
  try {
    const SHEET_ID = process.env[`SHEET_ID${number_sheet_id}`];
    return new GoogleSpreadsheet(SHEET_ID);
  } catch (err) {
    console.log('select_googlesheet_id', err);
  }
};

const init_action = async (
  number_sheet_id,
  sheet_name,
  begin_cell,
  char_range,
  end_cell
) =>
  await init_action_local(
    number_sheet_id,
    sheet_name,
    begin_cell,
    char_range,
    end_cell
  );

const init_action_local = async (
  number_sheet_id,
  sheet_name,
  begin_cell,
  char_range,
  end_cell
) => {
  try {
    const doc = select_googlesheet_id(number_sheet_id);
    await doc.useServiceAccountAuth(require('../../store-google.json'));
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle[sheet_name];
    const row_number = sheet.rowCount;
    const number_range = [begin_cell, end_cell ? end_cell : row_number];
    const range = char_range
      .split(":")
      .map((char_element, i) => {
        return `${char_element}${number_range[i]}`;
      })
      .join(":");
    await sheet.loadCells(range);
    return { sheet, number_range };
  } catch (err) {
    console.log('init_action', err);
  }
};

const update_sheet_date = async (sheet_name, number) => {
  try {
    const { sheet } = await init_action_local(
      number ? number : 1,
      sheet_name,
      1,
      'B:B',
      1
    );
    const current_cell_time = sheet.getCellByA1(`B1`);
    const time = new Date().toLocaleString({ timeZone: 'Europe/Kiev' });
    current_cell_time.value = time;
    await sheet.saveUpdatedCells();
  } catch (err) {
    console.log('update_sheet_date', err);
  }
};

module.exports = {
  init_action,
  update_sheet_date,
  ...config,
};
