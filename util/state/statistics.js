'use strict';
const { init_db_operation } = require('../../db/db');

exports.update_statistics_field = async (field, value) => {
  try {
    const time = new Date().toLocaleString({ timeZone: "Europe/Kiev" });
    const sql_update = value
      ? `UPDATE \`statistics\` SET \`${field}\` = '${value}', \`active_time\` = '${time}' `
      : `UPDATE \`statistics\` SET \`${field}\` = \`${field}\` + 1, \`active_time\` = '${time}' `;
    return await init_db_operation(sql_update);
  } catch (err) {
    console.log('update_statistics_field', err);
  }
};

exports.get_statistics_data = async () => {
  try {
    const sql_select = `SELECT * FROM statistics`;
    return await init_db_operation(sql_select);
  } catch (err) {
    console.log('get_statistics_data', err);
  }
};

exports.get_user_statistics_data = async () => {
  try {
    const sql_select = `SELECT crater, count(user_id) as users_count FROM user_statistics GROUP BY crater`;
    return await init_db_operation(sql_select, null, true);
  } catch (err) {
    console.log('get_statistics_data', err);
  }
};

exports.get_user_statistics_crater = async user_id => {
  try {
    const sql_select = `SELECT crater FROM user_statistics`;
    return await init_db_operation(sql_select);
  } catch (err) {
    console.log('get_user_statistics_crater', err);
  }
};

const generate_sql_table_crater_info = async (columns) => {
  const sql_template = `ALTER TABLE crater_info ADD COLUMN `;
  const sql_alter = Array.isArray(columns)
    ? columns.map((column) => `${sql_template}\`${column}\` INT NULL`)
    : [];
  for (const sql of sql_after) {
    await init_db_operation(sql);
  }
  // await Promise.allSettled(sql_alter.map(sql => init_db_operation(sql)));
};

exports.check_columns_crater_info = async (columns) => {
  //
  try {
    const current_columns = await get_columns_crater();
    if (columns.length != current_columns.length - 1) {
      current_columns.shift();
      const new_columns = columns.filter(
        (column) => current_columns.indexOf(column) == -1
      );
      await generate_sql_table_crater_info(new_columns);
    }
  } catch (err) {
    console.log('check_columns_crater_info', err);
  }
};

const get_columns_crater = async () => {
  try {
    const sql = `SHOW COLUMNS FROM crater_info`;
    return await init_db_operation(sql, null, true);
  } catch (err) {
    console.log('get_columns_crater', err);
  }
};

exports.update_statistics_crater_info = async (field) => {
  try {
    const sql_update = `UPDATE \`crater_info\` SET \`${field}\` = \`${field}\` + 1 `;
    return await init_db_operation(sql_update);
  } catch (err) {
    console.log('update_statistics_crater_info', err);
  }
};

exports.get_crater_info = async () => {
  try {
    const sql_select = `SELECT * FROM crater_info`;
    return await init_db_operation(sql_select);
  } catch (err) {
    console.log('get_crater_info', err);
  }
};

const get_day = (date) => {
  try {
    const format_date = (date) =>
      date
        ?.split(', ')
        .map((el, i) => (!i ? el?.split(".").reverse().join("-") : el))
        .join(' ');

    const server_date = (date) =>
      global.os != 'win32'
        ? new Date(date).setHours(new Date(date).getHours() - 5)
        : new Date(date).setHours(new Date(date).getHours() + 2);
    let day = new Date(server_date(format_date(date))).getDay();
    if (!day) day = 7;
    return day;
  } catch (err) {
    console.log('generate_time_period', err);
  }
};

const get_time = date => date.split(', ')[1];

const generate_time_period = (date) => {
  try {
    let current_day = get_day(date);
    const current_time = get_time(date);
    const week = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
    const time_range_arr = [...new Array(24)].map(
      (_, i) => `${i < 10 ? '0' + i : i}:00:00-${i < 10 ? '0' + i : i}:59:59`
    );
    const combine_time = [];
    week.forEach((day) => {
      time_range_arr.forEach((time) => {
        combine_time.push(`${day}, ${time}`);
      });
    });
    let id = 0;
    combine_time.some((combine, index) => {
      const combine_elements = combine.split(', ');
      const time_elements = combine_elements[1].split('-');
      if (
        combine_elements[0] == week[current_day - 1] &&
        time_elements[0] <= current_time &&
        current_time <= time_elements[1]
      ) {
        id = index;
        return true;
      }
    });
    return id;
  } catch (err) {
    console.log('generate_time_period', err);
  }
};

const update_current_crater_statistics = async (user_id, crater) => {
  try {
    const sql_select = `SELECT id FROM user_statistics WHERE user_id = ${user_id}`;
    const result = await init_db_operation(sql_select);
    if (result && result.id) {
      const sql_update = `UPDATE \`user_statistics\` SET crater = '${crater}' WHERE id = ${result.id}`;
      return await init_db_operation(sql_update);
    } else {
      const sql_insert = `INSERT INTO \`user_statistics\` (user_id, crater) VALUES (${user_id}, '${crater}')`;
      return await init_db_operation(sql_insert);
    }
  } catch (err) {
    console.log('update_current_crater_statistics', err);
  }
};

exports.update_users_crater_info = async (user_id, crater_element) => {
  try {
    const active_time = new Date().toLocaleString({ timeZone: 'Europe/Kiev' });
    const time_period = generate_time_period(active_time);
    const sql_select = `SELECT id FROM users_active_times_history WHERE user_id = ${user_id} AND time_period = ${time_period}`;
    const result = await init_db_operation(sql_select);
    await update_current_crater_statistics(user_id, crater_element);
    if (result && result.id) {
      const sql_update = `UPDATE \`users_active_times_history\` SET crater = '${crater_element}' WHERE id = ${result.id}`;
      return await init_db_operation(sql_update);
    } else {
      const sql_insert = `INSERT INTO \`users_active_times_history\` (user_id, time_period, crater) VALUES (${user_id}, '${time_period}', '${crater_element}')`;
      return await init_db_operation(sql_insert);
    }
  } catch (err) {
    console.log('update_users_crater_info', err);
  }
};

exports.get_count_crater_by_user = async (crater) => {
  try {
    const sql_select = `SELECT count(*) as users_count FROM users_active_times_history WHERE crater = 'crater.${crater}'`;
    return await init_db_operation(sql_select);
  } catch (err) {
    console.log('get_count_crater_by_user', err);
  }
};

exports.get_count_users_time = async () => {
  try {
    const sql_select = `SELECT count(*) as users_count, time_period FROM users_active_times_history GROUP BY time_period`;
    return await init_db_operation(sql_select, null, true);
  } catch (err) {
    console.log('get_count_crater_by_user', err);
  }
};
