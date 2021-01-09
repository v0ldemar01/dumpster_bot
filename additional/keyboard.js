'use strict';
const { set_current_key } = require("../util/state/state");

const init_keyboard = (ctx) => ({
  ['start']: `/start`,
  ['main_menu.to_category']: `${ctx.i18n.t('main_menu.to_category')}`,
  ['main_menu.to_search']: `${ctx.i18n.t('main_menu.to_search')}`,
  ['main_menu.cart']: `${ctx.i18n.t('main_menu.cart')}`,
  ['main_menu.favourite']: `${ctx.i18n.t('main_menu.favourite')}`,
  ['main_menu.to_my_orders']: `${ctx.i18n.t('main_menu.to_my_orders')}`,
  ['main_menu.about_company']: `${ctx.i18n.t('main_menu.about_company')}`,
  ['main_menu.call_to_me']: `${ctx.i18n.t('main_menu.call_to_me')}`,
  ['main_menu.shares']: `${ctx.i18n.t('main_menu.shares')}`,
  ['main_menu.answ_comm_question']: `${ctx.i18n.t(
    'main_menu.answ_comm_question'
  )}`,
  ['main_menu.instructions']: `${ctx.i18n.t('main_menu.instructions')}`,
  ['main_menu.company_contacts_time_of_work']: `${ctx.i18n.t(
    'main_menu.company_contacts_time_of_work'
  )}`,
  ['main_menu.feedback']: `${ctx.i18n.t('main_menu.feedback')}`,
  ['main_menu.call']: `${ctx.i18n.t('main_menu.call')}`,
  ['main_menu.back']: `${ctx.i18n.t('main_menu.back')}`,
  ['main_menu.toggle_news']: `${ctx.i18n.t('main_menu.toggle_news')}`,
});

exports.checkClickKeyboard = async ctx => {
  const keyboard = init_keyboard(ctx);
  const value_key = ctx.update.message?.text?.trim();
  const keyboard_click = Object.entries(keyboard).filter(
    ([_, keyboard_element]) => keyboard_element.trim() == value_key
  );
  if (!keyboard_click.length) return;
  const user_id =
    ctx.update?.message?.chat?.id ||
    ctx.update.callback_query?.message?.chat?.id ||
    ctx.update.callback_query?.from?.id;
  const key = keyboard_click[0][0];
  await set_current_key(user_id, key);
  return key;
};

exports.mixinClickKeyBoard = async (ctx, key_to) => {
  let back = false;
  if (key_to.trim() == ctx.i18n.t('main_menu.back').trim()) back = true;
  return [[ctx.i18n.t('main_menu.to')], [`${ctx.i18n.t('main_menu.stay')}`]];
};

exports.to_or_stay = ctx => {
  const key = ctx.update.message?.text;
  let result;
  if (key?.includes(ctx.i18n.t('main_menu.stay'))) {
    result = 'stay';
  } else if (key?.includes(ctx.i18n.t('main_menu.to'))) {
    result = 'to';
  }
  return result;
};
