'use strict';
const Markup = require('telegraf/markup');
const {
  get_company_ware_houses_by_filter,
} = require('../../util/novaposhta/nova_poshta');
const { get_ref_by_name } = require('../../util/db/select/get_locations');
const { user_language } = require('../../util/language');
const { set_template_data } = require('../../util/state/invoice');

const user_info_data_from = (data) =>
  data
    .reverse()
    .filter(
      ({
        own_full_name,
        own_contact,
        locality,
        address_number_department,
        type_delivery,
        type_payment,
        require_confirm,
        counterparty_id,
      }) =>
        own_full_name &&
        own_contact &&
        locality &&
        address_number_department &&
        type_delivery &&
        type_payment &&
        require_confirm &&
        counterparty_id
    );

const user_info_data_invoice_id = (data, invoice_id) =>
  data.filter(({ id }) => id == invoice_id);

exports.template_user_info = async (
  ctx,
  user_id,
  data,
  invoice_id,
  after,
  callback
) => {
  try {
    const user_info = after
      ? user_info_data_invoice_id(data, invoice_id)
      : user_info_data_from(data);
    if (!user_info || !user_info.length) return console.log('!user_info');
    console.log('user_info', user_info[0]);
    let {
      own_full_name,
      own_contact,
      locality,
      address_number_department,
      type_delivery,
      type_payment,
      require_confirm,
      counterparty_id,
      is_recipient,
      recipient_contact,
      recipient_full_name,
    } = user_info[0];
    own_full_name =
      !is_recipient || parseInt(is_recipient)
        ? own_full_name
        : recipient_full_name;

    own_contact =
      !is_recipient || parseInt(is_recipient) ? own_contact : recipient_contact;

    if (
      !own_full_name ||
      !own_contact ||
      !locality ||
      !(locality.includes('м. Львів') || address_number_department) ||
      !type_delivery ||
      !type_payment ||
      !require_confirm
    )
      return console.log('!!!');

    !after
      ? await set_template_data(
          {
            own_full_name,
            own_contact,
            locality,
            address_number_department,
            type_delivery,
            type_payment,
            require_confirm,
            counterparty_id,
          },
          invoice_id
        )
      : null;

    await user_language(ctx);
    const language = ctx.i18n.locale();
    locality = locality.split(", ")[0];

    const { ref } = await get_ref_by_name(locality);

    const is_full_format = `\n\n${own_full_name}\n${own_contact}`;
    require_confirm = parseInt(require_confirm);
    let message_text;
    if (type_delivery.includes('to_department')) {
      const result_data = await get_company_ware_houses_by_filter(
        ref,
        address_number_department
      );
      const new_result_data = result_data.map((element) =>
        language == 'ru' ? element.DescriptionRu : element.Description
      );
      const result_data_array = new_result_data[0]
        ? new_result_data[0].split(':')
        : null;

      if (!result_data_array) {
        await ctx.reply(`${ctx.i18n.t('to_order.error_department')}`);
        return console.log('!result_data_array');
      }
      message_text =
        `${locality}, ${result_data_array[0]}` +
        `\n${language == 'ru' ? 'Адрес' : 'Адреса'}: ${result_data_array[1]}` +
        `${is_full_format}` +
        `\n${ctx.i18n.t('to_order.payment_type_short')}: ${ctx.i18n.t(
          `to_order.${type_payment}`
        )}` +
        `\n${
          !require_confirm ? ctx.i18n.t('to_order.manager_confirm') : ''
        }${ctx.i18n.t('to_order.from_np_address_confirm')}`;
    } else {
      let del_np;
      if (type_delivery.includes('lviv')) del_np = false;
      message_text =
        `${language == 'ru' ? 'Адрес' : 'Адреса'}: ${
          !del_np ? 'м. Львів' : address_number_department
        }` +
        `${is_full_format}\n${ctx.i18n.t(
          'to_order.payment_type_short'
        )}: ${ctx.i18n.t(`to_order.${type_payment}`)}` +
        `\n${
          !require_confirm ? ctx.i18n.t('to_order.manager_confirm') : ''
        }${ctx.i18n.t('to_order.from_np_address_confirm')}`;
    }
    const markup = callback
      ? Markup.inlineKeyboard([
          [
            Markup.callbackButton(
              `${ctx.i18n.t('to_order.info_yes')}`,
              'write_yes'
            ),
          ],
          [
            Markup.callbackButton(
              `${ctx.i18n.t('to_order.check_full_name')}`,
              'check_full_name'
            ),
          ],
          [
            Markup.callbackButton(
              `${ctx.i18n.t('to_order.check_contact')}`,
              'check_contact'
            ),
          ],
          [
            Markup.callbackButton(
              `${ctx.i18n.t('to_order.check_city')}`,
              'check_city'
            ),
          ],
          [
            Markup.callbackButton(
              `${ctx.i18n.t('to_order.check_delivery_type')}`,
              'check_delivery_type'
            ),
          ],
          [
            Markup.callbackButton(
              `${ctx.i18n.t('to_order.check_payment_type')}`,
              'check_payment_type'
            ),
          ],
          [
            Markup.callbackButton(
              `${ctx.i18n.t('to_order.check_confirm')}`,
              'check_confirm'
            ),
          ],
        ]).extra()
      : Markup.inlineKeyboard([
          [
            Markup.callbackButton(
              `${ctx.i18n.t('to_order.info_yes')}`,
              'write_yes'
            ),
          ],
          [
            Markup.callbackButton(
              `${ctx.i18n.t('to_order.info_no')}`,
              'no_rewrite'
            ),
          ],
        ]).extra();
    await ctx.reply(message_text, markup);
    return true;
  } catch (err) {
    console.log('template_user_info', err);
  }
};
