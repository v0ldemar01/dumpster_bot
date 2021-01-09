'use strict';
const Markup = require('telegraf/markup');
const {
  get_all_accessories_to_category,
} = require('./db/select/get_categories_from');

const filter_category = ['xiaomi'];

exports.markup_template = async (result, type, i18n, checker, is_accessory) => {
  try {
    if (!result || !result.length) {
      console.log('!result || !result.length');
      return [];
    }
    let callback;
    if (Array.isArray(checker)) callback = checker[0];
    const markup_row = result
      .map((row, index) => [
        Markup.callbackButton(
          row[
            `${type}_${
              i18n.languageCode === 'ua'
                ? 'name'
                : is_accessory || !Array.isArray(checker)
                ? 'name_ru'
                : 'name'
            }`
          ],
          `${callback ? `${callback}__` : ''}${row[
            `${type}_name_en`
          ].toLowerCase()}`
        ),
      ])
      .filter((_, i, self) => {
        if (i + 1 != self.length) self[i].push(self[i + 1][0]);
        return i % 2 === 0;
      });
    if (markup_row[markup_row?.length - 1].length == 1 && !is_accessory)
      markup_row[markup_row?.length - 1].push({
        text: ' ',
        callback_data: 'empty',
        hide: false,
      });
    return markup_row;
  } catch (err) {
    console.log('markup_template', err);
  }
};

exports.markup_template_many = async (result_many, i18n) => {
  try {
    const concat_result = result_many.reduce((acc, current) => {
      const elem = acc.find(
        (item) => item.category_name === current.category_name
      );
      if (!elem) {
        if (!Array.isArray(current.brand_name)) {
          current.brand_name = [current.brand_name];
          current.brand_name_en = [current.brand_name_en];
        }
        return [...acc, current];
      } else {
        elem.brand_name = Array.isArray(elem.brand_name)
          ? elem.brand_name
          : [elem.brand_name];
        elem.brand_name_en = Array.isArray(elem.brand_name_en)
          ? elem.brand_name_en
          : [elem.brand_name_en];
        const currData = elem.brand_name.filter(
          (name) => name === current.brand_name
        );
        if (!currData.length) {
          elem.brand_name.push(current.brand_name);
          elem.brand_name_en.push(current.brand_name_en);
        }
        return [...acc];
      }
    }, []);
    const markup_res = [];
    const accessory_result = await get_all_accessories_to_category();
    concat_result.forEach((text_row, index) => {
      const cat_name_language =
        text_row[`category_name${i18n.languageCode === 'ua' ? '' : '_ru'}`];
      const cat_name_callback = text_row[`category_name_en`].toLowerCase();
      const markup_row = [
        [Markup.callbackButton(cat_name_language, cat_name_callback)],
      ];
      markup_row.push(
        ...text_row.brand_name
          .map((row, index) => [
            Markup.callbackButton(
              row,
              `${cat_name_callback}__${text_row.brand_name_en[
                index
              ].toLowerCase()}`
            ),
          ])
          .filter((_, i, self) => {
            if (i + 1 != self.length) self[i].push(self[i + 1][0]);
            return i % 2 === 0;
          })
      );
      if (markup_row[markup_row.length - 1].length == 1)
        markup_row[markup_row.length - 1].push({
          text: ' ',
          callback_data: 'empty',
          hide: false,
        });
      const accessory_addition = accessory_result.filter(
        ({ category_name_parent }) => category_name_parent == cat_name_callback
      );

      if (accessory_addition.length) {
        const acces_name_language =
          accessory_addition[0][
            `category_name${i18n.languageCode === 'ua' ? '' : '_ru'}`
          ];
        const acces_name_callback = `${cat_name_callback}__${accessory_addition[0]['category_name_en']}`;
        markup_row.push([
          Markup.callbackButton(acces_name_language, acces_name_callback),
        ]);
      }
      markup_res.push(markup_row);
    });
    markup_res.push([
      [
        Markup.callbackButton(i18n.t('general.reverse'), 'reverse'),
        Markup.callbackButton(i18n.t('general.forward'), 'forward'),
      ],
    ]);
    return markup_res;
  } catch (err) {
    console.log('markup_template_many', err);
  }
};
