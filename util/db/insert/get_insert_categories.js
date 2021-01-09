'use strict';
const { init_db_operation } = require('../../../db/db');
const { transliterate_names } = require('../../language');

const secondary_key_words = ['Аксесуари', 'Xiaomi'];

const upperWord = (text) => {
  return text
    .split(/\s+/)
    .map((word) => word[0].toUpperCase() + word.substring(1))
    .join(" ");
};

const insert_categories = async (categories_name) => {
  try {
    const sql_clear = 'TRUNCATE categories';
    const sql_insert =
      'INSERT INTO `store`.`categories` (category_name, category_name_en, category_name_ru) VALUES (?, ?, ?)';
    const sql_select = "SELECT * FROM categories";
    const sql_insert_accessory =
      'INSERT INTO `store`.`categories` (category_name, category_name_en, category_name_ru, is_accessory) VALUES (?, ?, ?, ?)';

    let new_categories_name = categories_name.map((category_name) =>
      category_name === 'Електротранспорт' ? 'Електро транспорт' : category_name
    );

    //let ru_categories_name = await translate_names(new_categories_name, 'ru');

    // ru_categories_name = ru_categories_name.map(ru_categories_name_element => {
    //   if (ru_categories_name_element == 'Б техника') {
    //     ru_categories_name_element = 'Б/у техника';
    //   }
    //   return ru_categories_name_element;
    // })

    let en_categories_name = transliterate_names(categories_name);

    const fix_many_words = (text) =>
      text?.split(' ')
        ? text?.split(' ').length != 1
          ? text?.split(' ').join('_').toLowerCase()
          : text.toLowerCase()
        : '';
    const fix_apostrophe = (text) =>
      text?.includes('`') ? text?.replace('`', '&') : text;

    en_categories_name = en_categories_name.map(fix_many_words);
    en_categories_name = en_categories_name.map(fix_apostrophe);

    await init_db_operation(sql_clear);
    for (let i = 0; i < categories_name.length; i++) {
      const category_name = categories_name[i];
      !category_name.includes('|')
        ? await init_db_operation(sql_insert, [
            category_name,
            en_categories_name[i],
            upperWord(categories_name[i]),
          ])
        : null;
    }

    const category_selecting = await init_db_operation(sql_select, null, true);

    const accessory_result = [];
    category_selecting.forEach(({ id, category_name }) => {
      categories_name.forEach((new_categories_name_element, index) => {
        if (!new_categories_name_element.includes('|')) return;
        const accessory_name = new_categories_name_element.split('|')[0];
        const categories_name_element = new_categories_name_element.split(
          "|"
        )[1];
        if (categories_name_element == category_name) {
          const accessory_name_en = en_categories_name[index].split('|')[0];
          const accessory_name_ru = upperWord(category_name.split('|')[0]);
          accessory_result.push([
            accessory_name,
            accessory_name_en,
            accessory_name_ru,
            id,
          ]);
        }
      });
    });
    for (const accessory_result_element of accessory_result) {
      await init_db_operation(sql_insert_accessory, accessory_result_element);
    }
  } catch (err) {
    console.log('insert_categories', err);
  }
};

const category_filter = ['Гаджети для спорту'];

exports.get_insert_categories = async (rows) => {
  try {
    const categories = [];
    rows.forEach((row) => {
      let category_elem = row.split('/')[0];
      if (!category_elem) return;
      if (category_filter.includes(category_elem))
        category_elem = row.split('/')[1];
      categories.push(category_elem);

      if (
        row.includes(secondary_key_words[0]) &&
        !category_elem.includes(secondary_key_words[0])
      ) {
        let accessory = row
          .split('/')
          .filter((row_element) =>
            row_element.includes(secondary_key_words[0])
          );
        const accessory_index = accessory[0].indexOf(secondary_key_words[0]);
        accessory = accessory[0].slice(accessory_index);
        categories.push(`${accessory}|${category_elem}`);
      }

      // if (category_elem?.includes(secondary_key_words[1])) {
      //   const filter_category_elem = row.split('/')[1];
      //   filter_category_elem ? categories.push(`${filter_category_elem}|${category_elem}`) : null;
      // }
    });

    await insert_categories(
      [...new Set(categories)].filter((element) => element)
    );
  } catch (err) {
    console.log('get_insert_categories', err);
  }
};
