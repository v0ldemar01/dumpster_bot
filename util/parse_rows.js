'use strict';

const used_goods_key = {
  ['Процесор']: 'cpu',
  ['Відеопроцесор']: 'gpu',
  ['Операційна система']: 'os',
  ['Оперативна пам\'ять']: 'ram',
  ['Об\'єм накопичувача']: 'rom',
  ['Ємність аккумулятора']: 'battery_capacity',
  ['Діагональ екрану']: 'screen_diagonal',
  ['Тип дисплею']: 'display_type',
  ['Тип матриці']: 'display_type',
  ['Встановленою ОС']: 'os',
  ['Роздільна здатність екрану']: 'screen_resolution',
  ['Графічний адаптер']: 'gpu',
  ['Основна камера']: 'main_camera',
  ['Фронтальна камера']: 'front_camera',
};

const secondary_field_words = [
  'screen_diagonal',
  'display_type',
  'screen_resolution',
  'code',
  'name',
  'color',
  'status',
  'creation_year',
  'img_src',
  'price',
];

exports.parse_rows = description => {
  try {
    const description_row = description.split('\n');
    return (parse_description_rows = description_row
      .map((element) => {
        const key_value = element.split(':');
        key_value[1] = key_value[1].trim();
        const new_key_value = used_goods_key[key_value[0]];
        key_value[0] = new_key_value ? new_key_value : null;
        if (!key_value[0]) {
          if (!key_value[1].includes(secondary_key_words[2])) {
            middle_rows.push(
              key_value[1]
                .split(" ")
                .map((field_value, i) => [
                  secondary_field_words[i],
                  field_value,
                ])
            );
          } else {
            middle_rows.push(
              key_value[1]
                .replace(
                  `${secondary_key_words[2]} `,
                  `${secondary_key_words[2]}_`
                )
                .split(" ")
                .map((field_value, i) => [
                  secondary_field_words[i],
                  field_value,
                ])
            );
          }
          return [];
        }
        return key_value;
      })
      .filter((parse_description_row) => parse_description_row.length));
  } catch (err) {
    console.log('parse_rows', err);
  }
};
