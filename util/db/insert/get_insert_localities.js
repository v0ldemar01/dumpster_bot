'use strict';
const { init_db_operation } = require('../../../db/db');

const insert_localities = async (localities_name, isCompany) => {
  try {
    let sql_clear;
    let sql_insert;
    if (isCompany) {
      sql_insert =
        'INSERT INTO `store`.`np_company_localities` (name, characteristic, ref) VALUES (?, ?, ?)';
      sql_clear = 'TRUNCATE np_company_localities';
    } else {
      sql_insert =
        'INSERT INTO `store`.`localities` (name, characteristic) VALUES (?, ?)';
      sql_clear = 'TRUNCATE localities';
    }
    await init_db_operation(sql_clear);
    for (const locality_name of localities_name) {
      if (Array.isArray(locality_name)) {
        const locality_field_name = locality_name[0].split(', ')[0];
        const locality_field_characteristic = locality_name[0]
          .split(', ')
          .slice(1)
          .join(', ');
        const Ref = locality_name[1];
        await init_db_operation(sql_insert, [
          locality_field_name,
          locality_field_characteristic,
          Ref,
        ]);
      }
    }
  } catch (err) {
    console.log('insert_localities', err);
  }
};

exports.get_insert_localities = async (localities_name) =>
  insert_localities(localities_name);

exports.get_insert_company_localities = async (localities_name, isCompany) =>
  insert_localities(localities_name, isCompany);
