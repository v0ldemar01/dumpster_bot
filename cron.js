'use strict';
const { CronJob } = require('cron');
const os = require('os');
global.os = os.platform();
const {
  current_answer_questions,
} = require('./util/googlesheets/answer_questions');
const { get_mailing_info } = require('./util/googlesheets/mailing');
const { fetch_goods } = require('./util/db/fetch');
const {
  get_insert_localities,
} = require('./util/db/insert/get_insert_counterparty');
const { queue_fetch_counterparty } = require('./util/moysklad/moysklad');
const {
  updateStatistics,
  updateUserInfo,
  updateCraterInfo,
  updateAreasInfo,
  updateActiveTimes,
} = require('./additional/user');
const { get_insert_mailing_info } = require('./util/state/mailing');
const { init_language_source } = require('./util/googlesheets/language_source');
const { get_time_mailing } = require('./util/state/state');
const {
  get_insert_company_localities,
} = require('./util/db/insert/get_insert_localities');
const { get_company_localities } = require('./util/novaposhta/nova_poshta');

let time_template;

(async () => {
  try {
    const { cron_schedule_mailing } = await get_time_mailing(
      'cron_schedule_mailing'
    );
    if (cron_schedule_mailing > 60) {
      time_template = `0 0 */${cron_schedule_mailing / 60} * * *`;
    } else {
      time_template = `0 */10 * * * *`;
    }
  } catch (err) {
    console.log(err);
  }

  const job_goods = new CronJob('00 30 00 * * *', async () => {
    try {
      console.log('fetching_goods:', new Date());
      await fetch_goods();
    } catch (err) {
      console.log('job_goods', err);
    }
  });

  job_goods.start();

  const job_counterparty = new CronJob('00 00 00 * * *', async () => {
    try {
      console.log('fetching_counterparty:', new Date());
      const counterparty_result = await queue_fetch_counterparty();
      await get_insert_localities(counterparty_result);
      console.log('complete fetching_counterparty', new Date())
    } catch (err) {
      console.log('job_goods', err);
    }
  });

  job_counterparty.start();

  const job_localities = new CronJob('00 10 00 * * *', async () => {
    try {
      console.log('fetching_np_locality:', new Date());
      const array_data = await get_company_localities();
      await get_insert_company_localities(array_data, true);
      console.log('complete fetching_np_locality', new Date())
    } catch (err) {
      console.log('job_goods', err);
    }
  });

  job_localities.start();

  const job_answ_quest = new CronJob('00 05 12 * * *', async () => {
    try {
      console.log('fetching_answer_questions:', new Date());
      await current_answer_questions();
      console.log('complete fetching_answer_questions:', new Date());
    } catch (err) {
      console.log('job_answ_quest', err);
    }
  });

  job_answ_quest.start();

  const job_statistics = new CronJob('30 */30 * * * *', async () => {
    try {
      console.log('fetching_statistics:', new Date());
      await updateStatistics();
      await updateUserInfo();
      await updateAreasInfo();
      await updateActiveTimes()
      console.log('complete fetching_statistics:', new Date());
    } catch (err) {
      console.log('job_statistics', err);
    }
  });

  job_statistics.start();

  const job_crater = new CronJob('0 10 */4 * * *', async () => {
    try {
      console.log('fetching_job_crater:', new Date());
      await updateCraterInfo();
      console.log('complete fetching_job_crater:', new Date());
    } catch (err) {
      console.log('job_crater', err);
    }
  });

  job_crater.start();

  const job_language_source = new CronJob('0 5 */1 * * *', async () => {
    try {
      console.log('fetching_language_source:', new Date());
      await init_language_source();
      console.log('complete fetching_language_source:', new Date());
    } catch (err) {
      console.log('job_language_source', err);
    }
  });

  job_language_source.start();

  const job_mailing = new CronJob(time_template, async () => {
    try {
      console.log('fetching_mailing:', new Date());
      const data = await get_mailing_info();
      await get_insert_mailing_info(data);
      console.log('complete fetching_mailing:', new Date());
    } catch (err) {
      console.log('job_mailing', err);
    }
  });

  job_mailing.start();  
})();
