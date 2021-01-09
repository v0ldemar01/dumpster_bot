'use strict';
const {
  init_action,
  update_sheet_date,
  SHEET2_NAME1,
} = require('./googlesheets');
const { makeRangeIterator } = require('./iterator');
const { get_columns_from } = require('../db/select/get_colums_from');

const get_goods_ms_fields = async () => {
  try {
    const char_range = 'A:B';
    const { sheet, number_range } = await init_action(
      2,
      SHEET2_NAME1,
      2,
      char_range
    );
    const cell_values = [];
    const it = makeRangeIterator(...number_range);
    let result = it.next();
    while (!result.done) {
      const row = [];
      char_range.split(':').forEach((char, index) => {
        const value = sheet.getCellByA1(`${char}${result.value}`)._rawData
          .formattedValue;
        if (!value) return;
        index == 1 ? row.push([value]) : row.push(value);
      });
      row.length ? cell_values.push(row.reverse()) : null;
      result = it.next();
    }
    return cell_values;
  } catch (err) {
    console.log('get_goods_ms_fields', err);
  }
};

exports.current_goods_fields = async () => {
  try {
    const goods_fields_in_array = await get_goods_ms_fields();
    const result_obj = {};
    goods_fields_in_array.forEach((field_element) => {
      result_obj[field_element[0]] = field_element[1];
    });
    delete result_obj['Бренд'];
    const mixin = {
      'Обсяг оперативної пам\'яті': 'ram',
      'Вбудована пам\'ять': 'rom',
      'Флеш пам\'ять': 'rom',
      'SSD': 'rom', //rom_ssd
      'Обсяг SSD': 'rom', //rom_ssd
      'Об\'єм пам\'яті': 'rom',
      'Об\'єм жорсткого диска': 'rom',
      'Накопичувач': 'rom',
      'Жорсткий диск, ГБ': 'rom',
      'Об\'єм накопичувача': 'rom',
      'Оперативна пам\'ять': 'ram',
    };

    Object.entries(mixin).forEach(([key, value]) => {
      result_obj[key] = value;
    });
    await update_sheet_date(SHEET2_NAME1, 2);
    return result_obj;
  } catch (err) {
    console.log('current_goods_fields', err);
  }
};
