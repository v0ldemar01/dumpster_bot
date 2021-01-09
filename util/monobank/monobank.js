'use strict';
const path =
  global.os == 'win32'
    ? __dirname.split('\\').slice(0, -2).join('\\')
    : __dirname.split('/').slice(0, -2).join('/');
require('dotenv').config({ path: path + '/.env' });
const axios = require('axios');
const { API_MONOBANK } = process.env;

const new_axios = axios.create({
  baseURL: 'https://api.monobank.ua',
  headers: { 'X-Token': API_MONOBANK },
});

const payment_url = (clientId, price, description = '') => {
  if (price < 100) price = 100;
  const description_component = description
    ? `&text=${encodeURIComponent(description)}`
    : '';
  return `https://send.monobank.ua/${clientId}?f=enable&amount=${price}${description_component}`;
};

exports.generate_url_payment = async (price, description) => {
  try {
    const {
      data: { clientId },
    } = await new_axios.get('/personal/client-info');
    return payment_url(clientId, price, description);
  } catch (err) {
    console.log('generate_url_payment', err);
  }
};

const get_statement = (id, difference) => {
  try {
    const time = new Date().getTime();
    const from_time = time - difference * 60 * 60 * 1000;
    return new_axios.get(`/personal/statement/${id}/${from_time}/${time}`);
  } catch (err) {
    console.log(err);
  }
};

exports.check_payment = async (comment, price, difference = 12) => {
  try {
    price = price <= 100 ? 100 : price;
    const {
      data: { accounts },
    } = await new_axios.get('/personal/client-info');
    if (Array.isArray(accounts) && accounts.length) {
      const { id } = accounts[0];
      const { data } = await get_statement(id, difference);
      const payment_element = data.filter(
        (data_element) => data_element.comment == comment
      );
      console.log(payment_element);
      if (payment_element[0] && payment_element[0].operationAmount == price)
        return true;
      return false;
    }
  } catch (err) {
    console.log('check_payment', err);
  }
};

exports.exchange_rates = async () => {
  try {
    const UAH = 980;
    const USD = 840;
    const { data } = await new_axios.get('/bank/currency');
    const current_filter_data = data.filter(
      ({ currencyCodeA, currencyCodeB }) =>
        currencyCodeA == USD && currencyCodeB == UAH
    );
    return current_filter_data[0].rateSell;
  } catch (err) {
    console.log('exchange_rates', err);
  }
};
