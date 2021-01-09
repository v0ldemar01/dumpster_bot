'use strict';
const WizardScene = require('telegraf/scenes/wizard');
const {
  get_true_recipient_full_name,
  get_true_recipient_contact,
  get_locality,
  get_address_number_department,
  set_consignment_note,
  get_invoice_ms_id,
} = require('../../util/state/invoice');
const { get_invoice_id, get_current_key } = require('../../util/state/state');
const {
  get_consignment_note,
  print_consignment_note,
  delete_consignment_note_file,
  і,
} = require('../../util/novaposhta/nova_poshta');
const { clear_space } = require("../clear");
const { mainKeyboard, keyboard_action } = require('../../util/keyboard');

const sleep = sec => new Promise(resolve => setTimeout(resolve, sec));

module.exports = new WizardScene(
  'consignment_note', 
  async ctx => {
    try {      
      await clear_space(ctx);
      const user_id =
        ctx.update?.message?.chat?.id ||
        ctx.update.callback_query?.message?.chat?.id ||
        ctx.update.callback_query?.from?.id;
      const direction = await keyboard_action(ctx);
      if (direction == 'check_menu') {
        await ctx.wizard.selectStep(ctx.wizard.cursor);
        return await ctx.wizard.step(ctx);
      } else if (direction) {
        const { current_key } = await get_current_key(user_id);
        const keyboard = mainKeyboard(ctx);
        await ctx.reply(
          `${ctx.i18n.t('main_menu.selected')} ${ctx.i18n.t(current_key)}`,
          keyboard
        );
        return await ctx.scene.enter(direction);
      }
      
      const { invoice_id } = await get_invoice_id(user_id);
      const { invoice_ms_id } = await get_invoice_ms_id(invoice_id);

      const name = await get_true_recipient_full_name(invoice_id);
      const full_name =
        !name.is_recipient || parseInt(name.is_recipient)
          ? name.own_full_name
          : name.recipient_full_name;

      const number = await get_true_recipient_contact(invoice_id);
      const contact =
        !number.is_recipient || parseInt(number.is_recipient)
          ? number.own_contact
          : number.recipient_contact;

      const { locality } = await get_locality(invoice_id);

      const { address_number_department } = await get_address_number_department(
        invoice_id
      );

      const IntDocNumber = await get_consignment_note(
        full_name,
        contact,
        locality,
        address_number_department
      );

      const source = await print_consignment_note(
        IntDocNumber,
        user_id,
        invoice_ms_id
      );

      await sleep(2000);
      await ctx.replyWithDocument({ source });
      await set_consignment_note(invoice_id, IntDocNumber);
      await delete_consignment_note_file(user_id, invoice_ms_id);

      return ctx.scene.leave();
    } catch (err) {
      console.log('consignment_note_callback1', err);
    }
});
