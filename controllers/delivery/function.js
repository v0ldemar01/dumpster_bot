'use strict';
const Markup = require('telegraf/markup');
const { payment_inline } = require('./payment');
const { update_statistics_field } = require('../../util/state/statistics');
const { edit_markup } = require('./edit_markup');
const { get_locality, get_type_payment } = require('../../util/state/invoice');
const { clear_space } = require('../clear');
const { mainKeyboard } = require('../../util/keyboard');
const { get_invoice_id } = require('../../util/state/state');

const localitty_filter = ['м. Львів'];

const get_to_session_city = async (ctx) => {
  try {
    const user_id =
      ctx.update?.message?.chat?.id ||
      ctx.update.callback_query?.message?.chat?.id ||
      ctx.update.callback_query?.from?.id;
    const { invoice_id } = await get_invoice_id(user_id);
    const { locality } = await get_locality(invoice_id);
    if (locality.includes(localitty_filter[0])) {
      ctx.session['city'] = true;
    }
  } catch (err) {
    console.log('get_to_session_city', err);
  }
};

const delivery_type_message_local = async (ctx) => {
  try {
    const keyboard = mainKeyboard(ctx);
    await ctx.reply(`${ctx.i18n.t('to_order.delivery')}`, keyboard);

    await get_to_session_city(ctx);
    ctx.session['city']
      ? await update_statistics_field('city_lviv_count')
      : await update_statistics_field('other_city_count');
    await ctx.reply(
      `${ctx.i18n.t(
        ctx.session['city'] ? 'to_order.delivery_type' : 'to_order.np_not_lviv'
      )}`,
      Markup.inlineKeyboard([
        ctx.session['city']
          ? [
              Markup.callbackButton(
                `${ctx.i18n.t('to_order.self_pickup_lviv')}`,
                'self_pickup_lviv'
              ),
            ]
          : [],
        ctx.session['city']
          ? [
              Markup.callbackButton(
                `${ctx.i18n.t('to_order.courier_lviv')}`,
                'courier_lviv'
              ),
            ]
          : [],
        [
          Markup.callbackButton(
            `${ctx.i18n.t('to_order.nova_poshta_to_department')}`,
            'nova_poshta_to_department'
          ),
        ],
        [
          Markup.callbackButton(
            `${ctx.i18n.t('to_order.nova_poshta_to_address')}`,
            'nova_poshta_to_address'
          ),
        ],
      ]).extra()
    );
  } catch (err) {
    console.log('delivery_type_message_local', err);
  }
};

exports.delivery_type_message = async (ctx) =>
  await delivery_type_message_local(ctx);

const payment_type_message_local = async (ctx, is_local) => {
  try {
    let selected_number_button;
    if (is_local) {
      selected_number_button = await check_callback_local(ctx);      
      if (!selected_number_button) return true;
    } else {
      await get_to_session_city(ctx);
      const user_id =
        ctx.update?.message?.chat?.id ||
        ctx.update.callback_query?.message?.chat?.id ||
        ctx.update.callback_query?.from?.id;
      const { invoice_id } = await get_invoice_id(user_id);
      const { type_payment } = await get_type_payment(invoice_id);
      const all_types_payment = [
        'cash',
        'terminal',
        'cash_on_delivery',
        'to_bank_card',
      ];
      selected_number_button = all_types_payment.indexOf(type_payment) + 1;
      if (!ctx.session['city']) selected_number_button -= 2;
      selected_number_button = Array.isArray(selected_number_button)
        ? selected_number_button
        : [selected_number_button];
    }
    is_local ? await clear_space(ctx, null, 2) : null;
    await ctx.reply(
      `${ctx.i18n.t('to_order.payment_type')}`,
      Markup.inlineKeyboard(payment_inline(ctx, selected_number_button)).extra()
    );
  } catch (err) {
    console.log('payment_type_message_local', err);
  }
};

exports.payment_type_message = async (ctx, is_local) =>
  await payment_type_message_local(ctx, is_local);

const confirm_message_local = async (ctx, is_local) => {
  try {
    if (is_local) {
      const selected_number_button = await check_callback_local(ctx);
      if (!selected_number_button) return true;
    }
    await clear_space(ctx);
    await ctx.reply(
      `${ctx.i18n.t('to_order.confirm')}`,
      Markup.inlineKeyboard([
        [Markup.callbackButton(`${ctx.i18n.t('to_order.yes')}`, 'confirm_yes')],
        [Markup.callbackButton(`${ctx.i18n.t('to_order.no')}`, 'confirm_no')],
      ]).extra()
    );
  } catch (err) {
    console.log('confirm_message_local', err);
  }
};

exports.confirm_message = async (ctx, is_local) =>
  await confirm_message_local(ctx, is_local);

const check_callback_local = async (ctx) => {
  try {
    return await edit_markup(ctx);
  } catch (err) {
    console.log('check_regexp_contact_local', err);
  }
};

exports.check_callback = async (ctx) => await check_callback_local(ctx);
