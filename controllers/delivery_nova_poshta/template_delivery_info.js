'use strict';
const Markup = require('telegraf/markup');
const {
  get_locality,
  get_address_number_department,
  get_type_delivery,
  get_recipient_full_name,
  get_recipient_contact,
} = require('../../util/state/invoice');
const {
  get_company_ware_houses_by_filter,
} = require('../../util/novaposhta/nova_poshta');
const { get_ref_by_name } = require('../../util/db/select/get_locations');
const { user_language } = require('../../util/language');
const { get_invoice_id } = require('../../util/state/state');

exports.template_delivery_info = async (
  ctx,
  user_id,
  is_full_format,
  del_np,
  is_local
) => {
  try {
    await user_language(ctx);

    const { invoice_id } = await get_invoice_id(user_id);
    let { locality } = await get_locality(invoice_id);
    locality = locality.split(', ')[0];
    const { address_number_department } = await get_address_number_department(
      invoice_id
    );

    const { ref } = await get_ref_by_name(locality);
    const { type_delivery } = await get_type_delivery(invoice_id);

    const { recipient_full_name } = await get_recipient_full_name(invoice_id);
    const { recipient_contact } = await get_recipient_contact(invoice_id);
    if (is_full_format) {
      is_full_format = `\n\n${recipient_full_name}\n${recipient_contact}`;
    } else {
      is_full_format = '';
    }
    if (type_delivery.includes('to_department')) {
      const result_data = await get_company_ware_houses_by_filter(
        ref,
        address_number_department
      );

      const language = ctx.i18n.locale();
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
      if (!is_local) {
        await ctx.reply(
          `${locality}, ${result_data_array[0]}\n${
            language == 'ru' ? 'Адрес' : 'Адреса'
          }: ${
            del_np ? 'м. Львів' : result_data_array[1]
          }${is_full_format}${ctx.i18n.t('to_order.from_np_address_confirm')}`,
          Markup.inlineKeyboard([
            [
              Markup.callbackButton(
                `${ctx.i18n.t('to_order.info_yes')}`,
                'from_np_address_yes'
              ),
            ],
            [
              Markup.callbackButton(
                `${ctx.i18n.t('to_order.info_no')}`,
                'no_rewrite'
              ),
            ],
          ]).extra()
        );
      }
    } else {
      if (!is_local) {
        await ctx.reply(
          `${language == 'ru' ? 'Адрес' : 'Адреса'}: ${
            del_np ? 'м. Львів' : address_number_department
          }${is_full_format}${ctx.i18n.t('to_order.from_np_address_confirm')}`,
          Markup.inlineKeyboard([
            [
              Markup.callbackButton(
                `${ctx.i18n.t('to_order.info_yes')}`,
                'from_np_address_yes'
              ),
            ],
            [
              Markup.callbackButton(
                `${ctx.i18n.t('to_order.info_no')}`,
                'no_rewrite'
              ),
            ],
          ]).extra()
        );
      }
    }
    return true;
  } catch (err) {
    console.log('template_delivery_info', err);
  }
};
