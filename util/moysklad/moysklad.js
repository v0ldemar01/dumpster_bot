'use strict';
const path = global.os == 'win32' ? 
  __dirname.split('\\').slice(0, -2).join('\\') : 
  __dirname.split('/').slice(0, -2).join('/');
require('dotenv').config({ path: path + '/.env' });
const {MS_USER, MS_PASSWORD} = process.env;
const fetch = require('node-fetch');
const Moysklad = require('moysklad');
const axios = require('axios');
const {get_counterparty} = require('../db/select/get_counterparty_from');

const new_axios = axios.create();
const ms_config = {
  login: MS_USER,
  password: MS_PASSWORD
};

new_axios.defaults.auth =  {
  username: MS_USER,
  password: MS_PASSWORD
};

const ms = Moysklad({ fetch, ...ms_config });

const timeout = msec => new Promise(resolve => setTimeout(resolve, msec));

exports.queue_fetch = async is_first => await queue_fetch_local(is_first);

const queue_fetch_local = async (
  is_first, 
  rows = [], 
  url = is_first ? '/entity/productfolder' : '/entity/product'
) => {
  try {
    const productsCollection = await ms.GET(url, {limit: 100});    
        
    const new_rows = [...rows, ...productsCollection.rows];  
    console.log(new_rows.length)
    await timeout(5000);    
    return productsCollection.meta.nextHref ? 
      await queue_fetch_local(is_first, new_rows, productsCollection.meta.nextHref) :
      new_rows;
  } catch (err) {
    console.log(err);
  }   
};

exports.get_public_url = url => new_axios.get(url);

const create_counterparty = async counterparty_name => {
  try {    
    const {attributes} = await ms.GET('/entity/counterparty/metadata');
    const new_attributes = attributes.map(({id, name, type}, index) => ({
      id,
      name, 
      type, 
      value: counterparty_name.split(' ')[1 - index]
    }));
    const {id, accountId, name, externalCode} = await ms.POST('/entity/counterparty', {
      name: counterparty_name, 
      attributes: new_attributes
    });  
    return {id, accountId, name, externalCode};
  } catch (err) {
    console.log('create_counterparty', err);
  }
};

const create_counterparty_contact_person = async (counterparty_id, contact_name, phone_contact) => {
  try {    
    const result = await ms.POST(`/entity/counterparty/${counterparty_id}/contactpersons`, {
      name: contact_name,
      phone: phone_contact
    });    
    return result.map(({id, accountId, name, externalCode, phone}) => ({
      id, 
      accountId, 
      name, 
      externalCode, 
      phone
    }));
  } catch (err) {
    console.log('create_contact_person_result', err);
  }
}; 

exports.queue_fetch_counterparty = async () => await queue_fetch_counterparty_local();

const queue_fetch_counterparty_local = async (rows = [], url = '/entity/counterparty') => {
  try {
    const counterpartyCollection = await ms.GET(url, {limit: 100});     
    const new_rows = [
      ...rows, 
      ...counterpartyCollection.rows.map(({id, name, phone}) => ({id, name, phone}))
    ];  
    await timeout(5000);
    return counterpartyCollection.meta.nextHref ? 
      await queue_fetch_counterparty_local(new_rows, counterpartyCollection.meta.nextHref) :
      new_rows;
  } catch (err) {
    console.log('queue_fetch_counterparty', err);
  }
}

exports.get_counterparty_info = async (name, contact) => {
  try {
    if (!name || !contact) return console.log('!name || !contact');
    let new_counterparty;
    let {id} = await get_counterparty(name, contact);
    !id ? new_counterparty = true : null;
    new_counterparty ? {id} = await create_counterparty(name) : null;
    const result = new_counterparty ? 
      await create_counterparty_contact_person(id, name, contact) :
      await get_counterparty_contact_person_local(id);
    return {
      counterparty_id: id,
      counterparty_contact_id: result[0].id,
    }
  } catch (err) {
    console.log('get_counterparty_info', err);
  }
} 

exports.get_counterparty_contact_person = async counterparty_id => 
  await get_counterparty_contact_person_local(counterparty_id); 

const get_counterparty_contact_person_local = async counterparty_id => {
  try {    
    const result = await ms.GET(`/entity/counterparty/${counterparty_id}`);    
    return result.meta;
  } catch (err) {
    console.log('get_contact_person_result', err);
  }
}; 

exports.get_entity = async () => {
  try {
    const result = await ms.GET('/entity/organization');    
    return result?.rows.filter(e => e)[0].meta;
  } catch (err) {
    console.log('get_entity', err);
  }
};

exports.create_customerorder = async (organization_meta, agent_meta, invoice_goods_info) => {
  try {
    const result = await ms.POST(`/entity/customerorder`, {
      organization: {
        meta: organization_meta
      }, 
      agent: {
        meta: agent_meta
      }, 
      positions: invoice_goods_info
    }); 
    return result;   
  } catch (err) {
    console.log('create_customerorder', err)
  }
};

exports.get_goods_info_by_id = async goods => {
  try {    
    for (const goods_block of goods) {
      const result = await ms.GET(`/entity/product/${goods_block.ms_goods_id}`);   
      goods_block.assortment = {};
      goods_block.assortment.meta = result.meta;
      goods_block.price = result.salePrices[0].value;
      delete goods_block.ms_goods_id;
    }
    return goods;
  } catch (err) {
    console.log('get_goods_info_by_id', err);
  }
};




