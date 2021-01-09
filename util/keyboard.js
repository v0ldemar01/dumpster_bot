'use strict';
const Markup = require('telegraf/markup');
const { checkClickKeyboard } = require('../additional/keyboard');
const { get_current_key } = require('./state/state');

exports.mainKeyboard = ctx => {
  const mainKeyboardCategory = ctx.i18n.t('main_menu.to_category');
  const mainKeyboardSearch = ctx.i18n.t('main_menu.to_search');
  const mainKeyboardCart = ctx.i18n.t('main_menu.cart');
  const mainKeyboardFavourite = ctx.i18n.t('main_menu.favourite');
  const mainKeyboardOrders = ctx.i18n.t('main_menu.to_my_orders');
  const mainKeyboardAbout = ctx.i18n.t('main_menu.about_company');
  const mainKeyboardCallToMe = ctx.i18n.t('main_menu.call_to_me');
  const mainKeyboardShares = ctx.i18n.t('main_menu.shares');
  const mainKeyboardQuestions = ctx.i18n.t('main_menu.answ_comm_question');
  const mainKeyboardInstructions = ctx.i18n.t('main_menu.instructions');
  return Markup.keyboard([
    [mainKeyboardCategory, mainKeyboardSearch],
    [mainKeyboardCart, mainKeyboardFavourite],
    [mainKeyboardOrders, mainKeyboardAbout],
    [mainKeyboardCallToMe, mainKeyboardShares],
    [mainKeyboardQuestions],
    [mainKeyboardInstructions],
  ])
    .oneTime()
    .resize()
    .extra();
};

exports.contactKeyboard = (ctx) =>
  Markup.keyboard([
    [Markup.contactRequestButton(`${ctx.i18n.t('to_order.contact_from_tg')}`)],
    [ctx.i18n.t('main_menu.back')],
  ])
    .oneTime()
    .resize()
    .extra();

exports.nameKeyboard = (ctx, full_names) =>
  Markup.keyboard([
    ...full_names.map((full_name) => [full_name]),
    [ctx.i18n.t('main_menu.back')],
  ])
    .oneTime()
    .resize()
    .extra();

exports.about_company = ctx => {
  const aboutKeyboardContactsTime = ctx.i18n.t(
    'main_menu.company_contacts_time_of_work'
  );
  const aboutKeyboardFeedback = ctx.i18n.t('main_menu.feedback');
  const aboutKeyboardCall = ctx.i18n.t('main_menu.call');
  const aboutKeyboardBack = ctx.i18n.t('main_menu.back');
  return Markup.keyboard([
    [aboutKeyboardContactsTime, aboutKeyboardFeedback],
    [aboutKeyboardCall],
    [aboutKeyboardBack],
  ])
    .oneTime()
    .resize()
    .extra();
};

exports.shares = ctx => {
  const sharesKeyboardToggle = ctx.i18n.t('main_menu.toggle_news');
  const sharesKeyboardBack = ctx.i18n.t('main_menu.back');
  return Markup.keyboard([[sharesKeyboardToggle], [sharesKeyboardBack]])
    .oneTime()
    .resize()
    .extra();
};

exports.keyboard_action = async (ctx) => {
  try {
    const check = await checkClickKeyboard(ctx);
    if (check) {
      if (ctx.session['main_menu']) {
        const user_id =
          ctx.update?.message?.chat?.id ||
          ctx.update.callback_query?.message?.chat?.id ||
          ctx.update.callback_query?.from?.id;
        const { current_key } = await get_current_key(user_id);
        ctx.session['main_menu'] = false;
        return choose_scene(current_key);
      } else {
        ctx.session['main_menu'] = true;
        return "check_menu";
      }
    }
  } catch (err) {
    console.log('keyboard_action', err);
  }
};

const choose_scene = key => {
  try {
    const key_value = {
      ['start']: 'start',
      ['main_menu.to_category']: 'self_search',
      ['main_menu.to_search']: 'smart_search',
      ['main_menu.cart']: 'cart',
      ['main_menu.favourite']: 'favourite',
      ['main_menu.answ_comm_question']: 'answer_question',
      ['main_menu.back']: 'cart',
    };    
    return key_value[key] ? key_value[key] : null;
  } catch (err) {
    console.log('choose_scene', err);
  }
};
