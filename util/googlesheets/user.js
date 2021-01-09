'use strict';
const {
  init_action,
  update_sheet_date,
  SHEET1_NAME_USERS,
  SHEET1_NAME_STATISTICS,
  SHEET1_NAME_TEXT,
  SHEET1_NAME_SCHEDULE,
} = require('./googlesheets');
const { makeRangeIterator } = require('./iterator');
const { generate_range } = require('./generate_range');

const sleep = (sec) => new Promise((resolve) => setTimeout(resolve, sec));

const find_user_in_sheet = (user_id, sheet) => {
  try {
    const it = makeRangeIterator(3, 200);
    let result = it.next();
    let current_coordinate;
    let not_user;
    let user_cell;
    do {
      current_coordinate = `A${result.value}`;
      user_cell = sheet.getCellByA1(current_coordinate)._rawData.formattedValue;
      if (user_cell == user_id) break;
      result = it.next();
      if (!user_cell) not_user = true;
    } while (user_cell);
    return not_user ? null : current_coordinate;
  } catch (err) {
    console.log('find_user_in_sheet', err);
  }
};

const update_user_in_sheet = async (sheet, users) => {
  try {
    for (const {
      user_id,
      username,
      name,
      last_time,
      current_position,
      city,
      ms_goods_id,
    } of users) {
      const coordinate = find_user_in_sheet(user_id, sheet);
      if (!coordinate) {
        await sheet.addRow([
          user_id,
          username,
          name,
          current_position,
          last_time,
          city,
          ms_goods_id,
        ]);
      } else {
        const number_coordinate = coordinate.split('').slice(1).join('');
        const data = [current_position, last_time, city, ms_goods_id];
        const char_range = ['D', 'E', 'F', 'G'];
        char_range.forEach((char, index) => {
          if (data[index]) {
            const current_cell_position = sheet.getCellByA1(
              `${char}${number_coordinate}`
            );
            current_cell_position.value = data[index];
          }
        });
      }
      await sheet.saveUpdatedCells();
    }
  } catch (err) {
    console.log('update_user_in_sheet', err);
  }
};

const clear_prev_values = async (
  sheet,
  char_range,
  number_range,
  check_char
) => {
  try {
    const { alphabet } = generate_range(char_range, number_range);
    const alphabet_range = alphabet.split('');
    for (const alpha of alphabet_range) {
      const it = makeRangeIterator(...number_range);
      let result = it.next();
      while (!result.done) {
        if (check_char) {
          const check_cell_position = sheet.getCellByA1(
            `${check_char}${result.value}`
          )._rawData.formattedValue;
          if (check_cell_position) {
            const current_cell_position = sheet.getCellByA1(
              `${alpha}${result.value}`
            );
            current_cell_position.value = 0;
            if (!(result.value % 10)) await sleep(1000);
          }
        } else {
          const current_cell_position = sheet.getCellByA1(
            `${alpha}${result.value}`
          );
          current_cell_position.value = 0;
          if (!(result.value % 10)) await sleep(1000);
        }

        result = it.next();
      }
    }
    await sheet.saveUpdatedCells();
  } catch (err) {
    console.log('clear_prev_values', err);
  }
};

exports.update_bot_user_info = async (data) => {
  try {
    const sheet_name = SHEET1_NAME_USERS;
    const { sheet } = await init_action(1, sheet_name, 3, 'A:G');
    await update_sheet_date(sheet_name);
    await update_user_in_sheet(sheet, data);
  } catch (err) {
    console.log("update_bot_user_info", err);
  }
};

exports.update_statistics = async (data, areas_users) => {
  try {
    const sheet_name = SHEET1_NAME_STATISTICS;
    const { sheet, number_range } = await init_action(1, sheet_name, 2, 'A:B');
    await update_sheet_date(sheet_name);
    await clear_prev_values(sheet, 'B:B', number_range, 'A');
    data.forEach((data_element, index) => {
      const current_cell_position = sheet.getCellByA1(`B${index + 2}`);
      current_cell_position.value = data_element;
    });

    const it = makeRangeIterator(...number_range);
    let result = it.next();
    while (!result.done) {
      const current_code = sheet.getCellByA1(`A${result.value}`)._rawData
        .formattedValue;
      if (current_code) {
        const current_code_value = areas_users.filter(
          (area) => area[0] == current_code
        );
        if (current_code_value && current_code_value.length) {
          const current_cell_position = sheet.getCellByA1(`B${result.value}`);
          current_cell_position.value = current_code_value[0][1];
          if (result.value % 10) await sleep(1000);
        }
      }
      result = it.next();
    }
    await sheet.saveUpdatedCells();
  } catch (err) {
    console.log('update_statistics', err);
  }
};

exports.update_crater_info = async (data) => {
  try {
    const sheet_name = SHEET1_NAME_TEXT;
    await update_sheet_date(sheet_name);
    const { sheet, number_range } = await init_action(1, sheet_name, 3, 'A:E');
    await clear_prev_values(sheet, 'E:E', number_range, 'A');
    const it = makeRangeIterator(...number_range);
    let result = it.next();
    while (!result.done) {
      const current_code = sheet.getCellByA1(`A${result.value}`)._rawData
        .formattedValue;
      if (
        current_code &&
        current_code.search(/\w/) != -1 &&
        current_code.search(/\d/) == -1
      ) {
        const current_code_value = data.filter(
          ({ crater }) => crater == current_code
        );
        if (current_code_value && current_code_value.length) {
          const current_cell_position = sheet.getCellByA1(`E${result.value}`);
          current_cell_position.value = current_code_value[0].users_count;
          if (!(result.value % 10)) await sleep(1000);
          await sheet.saveUpdatedCells();
        }
      }
      result = it.next();
    }
    console.log('complete_update_crater_info');
  } catch (err) {
    console.log('update_crater_info', err);
  }
};

exports.insert_areas_statistics = async (data) => {
  try {
    const sheet_name = SHEET1_NAME_STATISTICS;
    const { sheet } = await init_action(1, sheet_name, 17, 'A:A');
    await update_sheet_date(sheet_name);
    data.forEach((data_element, index) => {
      const current_cell_position = sheet.getCellByA1(`A${index + 17}`);
      current_cell_position.value = data_element;
    });
    await sheet.saveUpdatedCells();
    console.log('complete_insert_areas');
  } catch (err) {
    console.log('insert_areas_statistics', err);
  }
};

exports.update_time_users = async (data) => {
  try {
    const sheet_name = SHEET1_NAME_SCHEDULE;
    const char_range = 'B:Y';
    const { sheet, number_range } = await init_action(
      1,
      sheet_name,
      3,
      char_range,
      9
    );
    await update_sheet_date(sheet_name);
    const { alphabet } = generate_range(char_range, number_range);
    await clear_prev_values(sheet, char_range, number_range);
    data.forEach(({ users_count, time_period }) => {
      const row = Math.trunc(time_period / 24);
      const column = time_period - 24 * row;
      const char_column = alphabet[column];
      const current_cell_position = sheet.getCellByA1(
        `${char_column}${row + 3}`
      );
      current_cell_position.value = users_count;
    });
    console.log('complete_update_time_users');
    await sheet.saveUpdatedCells();
  } catch (err) {
    console.log('update_time_users', err);
  }
};

const get_crater_elements = async (number_range, sheet) => {
  try {
    const it = makeRangeIterator(...number_range);
    let result = it.next();
    const cell_codes = [];
    const cell_values = [];
    let checker;
    while (!result.done) {
      ['A', 'B'].forEach((e, i) => {
        if (!i) checker = true;
        const value_from = sheet.getCellByA1(`${e}${result.value}`)._rawData
          .formattedValue;
        if (!i && (!value_from || !value_from.includes("crater")))
          checker = false;
        checker
          ? i
            ? cell_values.push(
                value_from
                  .replace('етап', '')
                  .replace(/[\d\.:]/g, '')
                  .trim()
              )
            : cell_codes.push(value_from)
          : null;
      });
      result = it.next();
    }
    console.log(cell_codes, cell_values);
  } catch (err) {
    console.log('get_crater_elements', err);
  }
};

const get_crater_statistics = async () => {
  try {
    const sheet_name = SHEET1_NAME_TEXT;
    await update_sheet_date(sheet_name);
    const { sheet, number_range } = await init_action(1, sheet_name, 3, 'A:B');
    await get_crater_elements(number_range, sheet);
  } catch (err) {
    console.log('get_crater_statistics', err);
  }
};

const update_time_users = async () => {
  try {
    const sheet_name = SHEET1_NAME_SCHEDULE;
    const first_char = 'B';
    const end_char = String.fromCharCode(first_char.charCodeAt(0) + 23);
    const char_range = `${first_char}:${end_char}`;
    const { sheet, number_range } = await init_action(
      1,
      sheet_name,
      2,
      char_range,
      9
    );
    const { alphabet, it } = generate_range(char_range, number_range);
    await fill_time_range(sheet, alphabet);
  } catch (err) {
    console.log('update_time_users', err);
  }
};

const fill_time_range = async (sheet, char_range) => {
  try {
    const time_range_arr = [...new Array(24)].map(
      (_, i) =>
        `${i < 10 ? '0' + i : i}:00-${i + 1 < 10 ? '0' + (i + 1) : i + 1}:00`
    );
    const it = makeRangeIterator(...[1, char_range.length]);
    let result = it.next();
    while (!result.done) {
      const current_cell_position = sheet.getCellByA1(
        `${char_range[result.value - 1]}1`
      );
      if (!current_cell_position._rawData.formattedValue) {
        current_cell_position.value = time_range_arr[result.value - 1];
        if (result.value % 10) await sleep(1000);
      }
      result = it.next();
    }
    await sheet.saveUpdatedCells();
  } catch (err) {
    console.log('fill_time_range', err);
  }
};
