'use strict';

exports.inline_description = (result, get_many, i18n) => {
  try {
    const template = {
      ['smartphones']: `${result.price} ${result.rom ? result.rom : ''} ${
        result.color ? result.color : ''
      }`,
      ['used_equipment']: `${result.price} ${
        result.screen_diagonal ? result.screen_diagonal : ''
      } ${
        result.rom
          ? result.rom
          : result.rom_ssd
          ? result.rom_ssd
          : result.rom_hdd
          ? result.rom_hdd
          : ''
      } ${result.color ? result.color : ''}`,
      ['laptops']: `${result.price} ${
        result.screen_diagonal ? result.screen_diagonal : ''
      } ${
        result.rom
          ? result.rom
          : result.rom_ssd
          ? result.rom_ssd
          : result.rom_hdd
          ? result.rom_hdd
          : ''
      } ${result.color ? result.color : ''}`,
      ['tablets']: `${result.price} ${
        result.screen_diagonal ? result.screen_diagonal : ''
      } ${result.rom ? result.rom : ''} ${result.color ? result.color : ''}`,
      ['tvs']: `${result.price} ${
        result.screen_resolution ? result.screen_resolution : ''
      } ${result.smart_tv ? result.smart_tv : ''}`,
      ['smart_watch']: `${result.price}, ${
        result.goods_size ? result.goods_size : ''
      } ${result.color ? result.color : ''}`,
      ['electric_transport']: `${result.price}, ${
        result.wheel_diameter ? result.wheel_diameter : ''
      } ${result.color ? result.color : ''}`,
      ['gaming']: `${result.price}, ${result.rom ? result.rom : ''}`,
      ['children\'s_goods']: `${result.price}, ${
        result.age_category ? result.age_category : ''
      }`,
      ['other']: `${result.price}`,
    };
    let current_category;
    get_many.forEach((get_many_element) => {
      if (get_many_element.id == result.category_brand_id) {
        current_category = get_many_element.category_name_en;
      }
    });
    let result_description;
    if (current_category && Object.keys(template).includes(current_category)) {
      result_description = template[current_category];
    } else {
      result_description = template['other'];
    }
    return result_description + ` ${i18n.t('smart_search.more_details')}`;
  } catch (err) {
    console.log('inline_description', err);
  }
};
