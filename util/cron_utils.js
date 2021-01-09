'use strict';
const {CronJob} = require('cron');

exports.cronJobFactoryMailing = (ctx, { id, date, message }, users) => {
  try {
    if (new Date(date) < new Date()) return;
    return new CronJob(
      new Date(date),
      async () =>
        await mailing(
          ctx,
          users.map(({ user_id }) => user_id),
          { text: message },
          id
        )
    );
  } catch (err) {
    console.log('cronJobFactoryMailing', err);
  }
};

exports.cronJobCheckNewMailing = () => {
  try {
    return new CronJob('0 */30 * * * *', async () => {
      try {
        const result = await get_mailing();
        if (result && result.length) await change_view();
      } catch (err) {
        console.log('cron_callback', err);
      }
    });
  } catch (err) {
    console.log('cronJobCheckNewMailing', err);
  }
};

exports.cronJobWrapper = (date, callback, date_variant) => {
  try {
    return new CronJob(date_variant ? date : new Date(date), callback);
  } catch (err) {
    console.log('cronJobWrapper', err);
  }
};
