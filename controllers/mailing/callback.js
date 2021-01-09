'use strict';
const { get_all_users, find_favourites } = require('../../util/state/goods');
const { get_time_mailing } = require('../../util/state/state');
const {
  get_mailing,
  change_view_status,
  mailing_feedback,
} = require('../../util/state/mailing');
const { mailing } = require('./mailing');
const { cronJobWrapper } = require('../../util/cron_utils');
const { get_mailing_columns } = require('../../util/googlesheets/mailing');

const format_date = (date) =>
  date
    ?.split(' ')
    .map((el, i) => (!i ? el?.split('.').reverse().join('-') : el))
    .join(' ');

const server_date = (date) =>
  global.os != 'win32'
    ? new Date(date).setHours(new Date(date).getHours() - 7)
    : date;

const parse_mailing_data = async (result) => {
  try {
    const column = await get_mailing_columns();
    const additional_filter_array = [
      ...column.slice(0, 9),
      ...column.slice(11, 14),
    ];    
    
    const new_result = result.map((element) => {
      element.crater_filter
        ? mixin_property(element.crater_filter, element, additional_filter_array) : null;
      element.additional
        ? mixin_property(element.additional, element, additional_filter_array) : null;
      return element;
    });
    return new_result;
  } catch (err) {
    console.log('parse_mailing_data', err);
  }
};

const mixin_property = (property, object, filter) => {
  const parse_additionap = [
    'all_users',
    'low_mark',
    'birthday_soon',
    'user_id',
    'language_filter',
    'filter_crater',
    'filter_brand',
    'filter_category',
    'is_favourite',
    'message',
    'button',
    'button_ref',
    'href',
  ];
  property.split('; ').forEach((el) => {
    filter.forEach((e, i) => {
      if (el.split(':')[0] == e)
        object[parse_additionap[i]] = el
          .split(':')
          .slice(1)
          .join(':')
          .trim();
    });
  })
};

const execute_mailing = async (ctx, data) => {
  try {
    data = [
      {
        id: 1,
        mailing_sheet_id: 28,
        mailing_type: "",
        crater_filter:
          "Бренд: Lenovo; Категорія товару: Ноутбуки; Додано в обране: true; ",
        users_count: 0,
        message: "Тест2",
        additional: null,
        conversion_users: 0,
        date: "05.01.2021 22:00:00",
        status: "Pending",
        view: null,
        filter_brand: "Lenovo",
        filter_category: "Ноутбуки",
        is_favourite: "true",
      },
    ];
    console.log(data);
    let users = await get_all_users();
    users = Array.isArray(users) ? users : [];
    console.log(await filter_user(users, data[0]));
    const callback = async (
      ctx,
      { id, message, button, button_ref, href },
      input,
      users
    ) => {
      const new_users = (await filter_user(users, input)).map(
        ({ user_id }) => user_id
      );
      return await mailing(ctx, new_users, {
        text: message,
        button: button ? button : '',
        button_ref: button_ref ? button_ref : '',
        href: href ? href : '',
      });
    };
    const cron_data = data
      .map(({ id, date, message, button, button_ref, href }, i) => {
        const check = new Date(server_date(format_date(date))) > new Date();
        return check
          ? cronJobWrapper(
              server_date(format_date(date)),
              async () =>
                await callback(
                  ctx,
                  { id, message, button, button_ref, href },
                  data[i],
                  users
                )
            )
          : null;
      })
      .filter((e) => e)
      .map((element) => element && element.start());
    data.forEach(({ date }) =>
      new Date(server_date(format_date(date))) > new Date()
        ? console.log('jobs created', date)
        : null
    );
  } catch (err) {
    console.log('bot_mailing', err);
  }
};

const filter_user = async (users, input) => {
  const key_value = {
    ['all_users']: '',
    ['birthday_soon']: '',
    ['language_filter']: 'language',
    ['user_id']: 'user_id',
    ['filter_crater']: 'current_position',
    ['filter_brand']: 'selected_brand',
    ['filter_category']: 'selected_category',
    ['is_favourite']: 'is_favourite',
  };
  const filter = {};
  Object.entries(input).forEach(([key, value]) => {
    if (value) {
      const to_sql_filter = key_value[key];
      let new_value = value;
      if (to_sql_filter == 'language') {
        new_value = parse_language(value);
      }
      if (to_sql_filter && new_value) filter[to_sql_filter] = new_value;
    }
  });
  console.log('filter', filter);
  if (
    filter['selected_brand'] &&
    filter['selected_category'] &&
    filter['is_favourite']
  ) {
    const users_res = await find_favourites(
      filter['selected_category'],
      filter['selected_brand']
    );
    const users_array = users_res.map(({ user_id }) => user_id);
    users = users.filter(({ user_id }) => {
      let check = false;
      users_array.some((user_in_array) => {
        if (user_in_array == user_id) check = true;
      });
      return check;
    });
  }
  delete filter['selected_brand'];
  delete filter['selected_category'];
  delete filter['is_favourite'];
  return users.filter((user) => {
    let check = true;
    Object.entries(filter).forEach(([key, value]) => {
      if (user[key] != value) check = false;
    });
    return check;
  });
};

const parse_language = (language_value) => {
  if (language_value.includes('UA')) {
    return 'ua';
  } else if (language_value.includes('RU')) {
    return 'ru';
  } else {
    return false;
  }
};

exports.launchMailingJob = async ctx => {
  const { bot_schedule_mailing } = await get_time_mailing(
    'bot_schedule_mailing'
  );
  let time_template;
  if (bot_schedule_mailing > 60) {
    time_template = `0 0 */${bot_schedule_mailing / 60} * * *`;
  } else {
    time_template = `0 */2 * * * *`;
  }
  console.log('JOB MAILING STARTED!!!', time_template);
  const mailingCheckingJob = cronJobWrapper(
    time_template,
    async () => {
      try {
        const result = await get_mailing();
        await execute_mailing(ctx);
        // if (result && result.length) {
        //   await change_view_status();
        //   const format_result = await parse_mailing_data(result);
        //   await execute_mailing(ctx, format_result);
        // } else {
        //   console.log('No mailing available')
        // }
      } catch (err) {
        console.log('launchMailingJob', err);
      }
    },
    true
  );
  mailingCheckingJob.start();
};
