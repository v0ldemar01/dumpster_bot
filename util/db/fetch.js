'use strict';
const { queue_fetch, get_public_url } = require('../moysklad/moysklad');
const { get_insert_brands } = require('./insert/get_insert_brands');
const { get_insert_categories } = require('./insert/get_insert_categories');
const { get_insert_many_to_many } = require('./insert/get_insert_many_to_many');
const {
  get_insert_goods,
  check_prev_new_goods,
} = require('./insert/get_insert_goods');
const { delete_from } = require('./delete/delete_from');

const timeout = msec => new Promise(resolve => setTimeout(resolve, msec));

const get_public_urls = async (data) => {
  try {
    const public_hrefs = [];
    let count = 0;
    while (count < data.length) {
      const url = data[count].image?.miniature?.href;
      const name = data[count].name;
      if (url) {
        const response = await get_public_url(url);
        public_hrefs.push({ href: response.request.res.responseUrl, name });
        await timeout(2700);
      }
      count++;
    }
    return public_hrefs;
  } catch (err) {
    console.log('get_public_urls', err);
  }
};

const sequence_to_do = async (is_first, is_all) => {
  try {
    const all_data = await queue_fetch(is_first);
    const product_rows = all_data.map(({ name, pathName, attributes }) => ({
      name: `${pathName != '' ? pathName + '/' + name : pathName + name}`,
      attribute: attributes && attributes.length ? attributes : '',
    }));
    const category_rows = all_data.map(
      ({ name, pathName, attributes }) =>
        `${pathName != '' ? pathName + '/' + name : pathName + name}`
    );
    const ext_product_rows = all_data.map(
      ({
        id,
        accountId,
        name,
        description,
        code,
        externalCode,
        pathName,
        buyPrice,
        minPrice,
        weight,
        volume,
      }) => ({
        id,
        accountId,
        name,
        description,
        code,
        externalCode,
        pathName,
        value: buyPrice?.value,
        minPrice,
        weight,
        volume,
      })
    );
    return is_first ? category_rows : [product_rows, all_data];
  } catch (err) {
    console.log('sequence_to_do', err);
  }
};

const mixin_new_url = async (all_data) => {
  try {
    const public_urls = await get_public_urls(all_data);
    return all_data.map((goods_element) => {
      public_urls.some((url) => {
        if (goods_element.name == url.name) {
          goods_element.href = url.href;
          return true;
        }
      });
      return goods_element;
    });
  } catch (err) {
    console.log('mixin_new_url', err);
  }
};

const insertion_goods = async (data, force) => {
  try {
    for (let i = 0; i < data.length; i += 100) {
      console.log('iteration', new Date());
      const result = await mixin_new_url(data.slice(i, i + 100));
      await get_insert_goods(result, force);
    }
  } catch (err) {
    console.log('insertion_goods', err);
  }
};

exports.fetch_goods = async (force) => {
  try {    
    let is_first = true;
    //const rows_for_category = await sequence_to_do(is_first);
    is_first = false;
    //await get_insert_categories(rows_for_category);
    console.log(new Date(), 'Moysklad fetch productfolder is completed!');

    const [product_rows, all_data] = await sequence_to_do(is_first);

    await get_insert_brands(product_rows);
    await get_insert_many_to_many(product_rows);

    if (force) {
      try {
        await delete_from('goods');
        await insertion_goods(all_data, true);
      } catch (err) {
        console.log(err);
      }
    } else {
      const [new_goods_data, old_goods_data] = await check_prev_new_goods(all_data);
      console.log(new_goods_data.length, old_goods_data);
      await insertion_goods(new_goods_data, true)
      await insertion_goods(old_goods_data);      
    }

    console.log(new Date(), 'Moysklad fetch product is completed!');
  } catch (err) {
    console.log('fetch_goods', err);
  }
};
