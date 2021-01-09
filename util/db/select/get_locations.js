'use strict';
const { init_db_operation } = require('../../../db/db');

exports.get_localities = async (input_locality = "", isCompany) => {
  try {
    const sql = `SELECT name, characteristic FROM ${
      isCompany ? "np_company_localities" : "localities"
    } WHERE name LIKE '%${input_locality}%'`;
    return await init_db_operation(sql, null, true);
  } catch (err) {
    console.log('get_localities', err);
  }
};

exports.get_ref_by_name = async (name) => {
  const sql = `SELECT name, ref FROM np_company_localities WHERE name LIKE '%${name}%'`;
  try {
    return await init_db_operation(sql);
  } catch (err) {
    console.log('get_ref_by_name', err);
  }
};
