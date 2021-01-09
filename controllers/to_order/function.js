'use strict';
const Markup = require('telegraf/markup');
const {
  set_own_contact,
  set_own_full_name,
  set_locality,
  get_info_is_recipient,
  set_recipient_full_name,
  set_recipient_contact,
  get_all_full_names,
} = require('../../util/state/invoice');
const { get_invoice_id, update_city } = require('../../util/state/state');
const { nameKeyboard } = require('../../util/keyboard');

exports.request_contact_message = async (ctx, is_init, other) => {
  try {
    if (is_init) {
      await ctx.reply(`${ctx.i18n.t('to_order.init')}`);
    }
    await ctx.reply(
      `${ctx.i18n.t(
        other ? 'to_order.recipient_contact' : 'to_order.contact'
      )}`,
      Markup.keyboard([
        [
          Markup.contactRequestButton(
            `${ctx.i18n.t('to_order.contact_from_tg')}`
          ),
        ],
        [ctx.i18n.t('main_menu.back')],
      ])
        .oneTime()
        .resize()
        .extra()
    );
    await message_get_contact(ctx);
  } catch (err) {
    console.log('request_contact_message', err);
  }
};

exports.check_regexp_contact = async (ctx, is_local, other) => {
  try {
    const check_action = await make_contact(ctx);
    if (check_action && check_action != 'OK') return 'callback';
    let contact =
      ctx.update.message?.contact?.phone_number ||
      ctx.update.message?.text ||
      ctx.update.callback_query?.message?.text;
    if (!contact || contact.search(/^\+?3?8?(0\d{9})$/) == -1) return true;
    const user_id =
      ctx.update?.message?.chat?.id ||
      ctx.update.callback_query?.message?.chat?.id ||
      ctx.update.callback_query?.from?.id;
    const { invoice_id } = await get_invoice_id(user_id);
    const { is_recipient } = await get_info_is_recipient(invoice_id);

    if (is_recipient && !parseInt(is_recipient)) {
      await set_recipient_contact(invoice_id, contact);
    } else if (is_recipient) {
      await set_own_contact(invoice_id, contact);
    } else {
      other
        ? await set_recipient_contact(invoice_id, contact)
        : await set_own_contact(invoice_id, contact);
      is_local ? await request_full_name_local(ctx) : null;
    }
  } catch (err) {
    console.log('check_regexp_contact', err);
  }
};

const request_full_name_local = async (ctx, other, local) => {
  try {
    const user_id =
      ctx.update?.message?.chat?.id ||
      ctx.update.callback_query?.message?.chat?.id ||
      ctx.update.callback_query?.from?.id;
    const full_names_results = await get_all_full_names(user_id);
    const full_names = [
      ...new Set(
        full_names_results.map(({ own_full_name, recipient_full_name }) =>
          recipient_full_name ? recipient_full_name : own_full_name
        )
      ),
    ].filter((e) => e);
    const keyboard = nameKeyboard(ctx, full_names);
    await ctx.reply(
      other
        ? `${ctx.i18n.t('to_order.for_not_me_info')}`
        : `${ctx.i18n.t('to_order.enter_yourself')}`,
      keyboard
    );
  } catch (err) {
    console.log('request_full_name', err);
  }
};

exports.request_full_name = async (ctx, other, local) =>
  await request_full_name_local(ctx, other, local);

exports.check_correct_full_name = async (ctx, is_local, other) => {
  try {
    let error;
    const text = ctx.update.message?.text;
    if (!text) error = true;
    if (
      text &&
      (text.split(' ').length == 1 ||
        !text.split(' ').some((element) => element.match(/[а-яА-Я]{2,}/)))
    )
      error = true;
    if (error) {
      if (other) {
        await ctx.reply(`${ctx.i18n.t('to_order.for_not_me_info')}`);
      } else {
        await ctx.reply(`${ctx.i18n.t('to_order.enter_yourself')}`);
      }
      return true;
    }
    const user_id =
      ctx.update?.message?.chat?.id ||
      ctx.update.callback_query?.message?.chat?.id ||
      ctx.update.callback_query?.from?.id;
    const { invoice_id } = await get_invoice_id(user_id);
    const { is_recipient } = await get_info_is_recipient(invoice_id);

    if (is_recipient && !parseInt(is_recipient)) {
      await set_recipient_full_name(invoice_id, text);
    } else if (is_recipient) {
      await set_own_full_name(invoice_id, text);
    } else {
      other
        ? await set_recipient_full_name(invoice_id, text)
        : await set_own_full_name(invoice_id, text);
      is_local ? await request_type_recipient_local(ctx) : null;
    }
  } catch (err) {
    console.log('check_correct_full_name', err);
  }
};

const request_type_recipient_local = async (ctx) => {
  try {
    await ctx.reply(
      `${ctx.i18n.t('to_order.button')}`,
      Markup.inlineKeyboard([
        [Markup.callbackButton(`${ctx.i18n.t('to_order.me')}`, 'me')],
        [Markup.callbackButton(`${ctx.i18n.t('to_order.other')}`, 'other')],
      ]).extra()
    );
  } catch (err) {
    console.log('request_type_recipient', err);
  }
};

exports.request_type_recipient = async (ctx) =>
  await request_type_recipient(ctx);

exports.request_city = async (ctx) => {
  try {
    await ctx.reply(
      `${ctx.i18n.t('to_order.enter_city')}`,
      Markup.inlineKeyboard([
        [
          Markup.switchToCurrentChatButton(
            ctx.i18n.t('to_order.select_from_list'),
            'locality ',
            false
          ),
        ],
      ]).extra()
    );
  } catch (err) {
    console.log('request_city', err);
  }
};

exports.check_correct_city = async (ctx) => {
  try {
    const user_id = ctx.update.message?.from?.id;
    const message = ctx.update.message?.text;
    if (message && (message.includes('м.') || message.includes('с.'))) {
      const { invoice_id } = await get_invoice_id(user_id);
      await set_locality(invoice_id, message);
      const { is_recipient } = await get_info_is_recipient(invoice_id);
      if (is_recipient) await update_city(invoice_id, message);
    }
  } catch (err) {
    console.log('check_correct_city', err);
  }
};

const message_get_contact = async (ctx) => {
  try {
    const array = [...Array(9)].map((_, i) => i + 1);
    const markup = array.map((_, i) =>
      Markup.callbackButton(i + 1, `${i + 1}`)
    );
    const new_length = markup.length / 3;
    const new_markup = new Array(3)
      .fill()
      .map((_) => markup.splice(0, new_length));
    const other_markup_elements = ['<--', '0', 'OK'];
    new_markup.push(
      other_markup_elements.map((e) => Markup.callbackButton(e, e))
    );

    await ctx.reply(`+38`, Markup.inlineKeyboard(new_markup).extra());
  } catch (err) {
    console.log('message_get_contact', err);
  }
};

const make_contact = async (ctx) => {
  try {
    if (
      ctx.update.message?.reply_to_message?.text ==
      ctx.i18n.t('to_order.contact')
    )
      return false;
    const adding = ctx.update.callback_query?.data;
    let isChange = adding;

    const message_text = ctx.update.callback_query?.message?.text;
    if (!message_text || !message_text.includes('+38')) return;
    const { reply_markup } = ctx.update.callback_query?.message;

    const new_message_text =
      !isNaN(parseInt(adding)) && adding != 'OK'
        ? message_text + (adding ? adding : '')
        : message_text.split('').pop() != '+'
        ? message_text.split('').slice(0, -1).join('')
        : (isChange = false);
    if (adding == 'OK') return 'OK';

    if (isChange) await ctx.editMessageText(new_message_text, { reply_markup });
    return adding ? true : false;
  } catch (err) {
    console.log('make_contact', err);
  }
};
