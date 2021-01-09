'use strict';
const {
  get_true_recipient_full_name,
  get_true_recipient_contact,
  set_counterparty,
  set_counterparty_contact,
  get_invoice_goods_id,
  set_invoice_ms_id,
} = require('../../util/state/invoice');
const { get_invoice_id } = require('../../util/state/state');
const {
  get_entity,
  get_counterparty_contact_person,
  create_customerorder,
  get_goods_info_by_id,
  get_counterparty_info,
} = require('../../util/moysklad/moysklad');

exports.create_order = async (ctx) => {
  try {
    const user_id =
      ctx.update?.message?.chat?.id ||
      ctx.update.callback_query?.message?.chat?.id ||
      ctx.update.callback_query?.from?.id;
    const { invoice_id } = await get_invoice_id(user_id);

    const this_name = await get_true_recipient_full_name(invoice_id);

    const full_name =
      !this_name.is_recipient || parseInt(this_name.is_recipient)
        ? this_name.own_full_name
        : this_name.recipient_full_name;

    const number = await get_true_recipient_contact(invoice_id);
    const contact =
      !number.is_recipient || parseInt(number.is_recipient)
        ? number.own_contact
        : number.recipient_contact;

    const {
      counterparty_id,
      counterparty_contact_id,
    } = await get_counterparty_info(full_name, contact);

    await set_counterparty(invoice_id, counterparty_id);
    await set_counterparty_contact(invoice_id, counterparty_contact_id);
    const organization_meta = await get_entity();

    const agent_meta = await get_counterparty_contact_person(counterparty_id);
    const invoice_goods_info = await get_invoice_goods_id(invoice_id);

    const format_goods_info = await get_goods_info_by_id(invoice_goods_info);

    const { name } = await create_customerorder(
      organization_meta,
      agent_meta,
      format_goods_info
    );
    await set_invoice_ms_id(invoice_id, name);
  } catch (err) {
    console.log('create_order', err);
  }
};
