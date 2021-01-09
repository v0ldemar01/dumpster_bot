'use strict';
const {init_db_operation} = require('../../db/db');
const {get_company_areas} = require('../novaposhta/nova_poshta');
const set_contact = async (invoice_id, contact, is_mine) => {
  try {
    const sql_update = `UPDATE \`invoice\` SET ${is_mine ? 'own_contact' : 'recipient_contact'} = ? WHERE id = ?`;        
    return await init_db_operation(sql_update, [contact, invoice_id]);
  } catch (err) {
    console.log('set_contact', err);
  }  
};

const get_contact = async (invoice_id, is_mine) => {
  try {
    const sql_select = `SELECT ${is_mine ? 'own_contact' : 'recipient_contact'} FROM invoice WHERE id = ?`;        
    return await init_db_operation(sql_select, invoice_id);
  } catch (err) {
    console.log('get_contact', err);
  }  
};

exports.set_own_contact = async (invoice_id, contact) => await set_contact(invoice_id, contact, true);

exports.set_recipient_contact = async (invoice_id, contact) => await set_contact(invoice_id, contact);

exports.get_own_contact = async invoice_id => await get_contact(invoice_id, true);

exports.get_recipient_contact = async invoice_id => await get_contact(invoice_id);

const set_full_name = async (invoice_id, full_name, is_mine) => {
  try {
    const sql_update = `UPDATE \`invoice\` SET ${is_mine ? 'own_full_name' : 'recipient_full_name'} = ? WHERE id = ?`;        
    return await init_db_operation(sql_update, [full_name, invoice_id]);
  } catch (err) {
    console.log('set_full_name', err);
  }  
};

exports.set_own_full_name = async (invoice_id, full_name) => await set_full_name(invoice_id, full_name, true);

exports.set_recipient_full_name = async (invoice_id, full_name) => await set_full_name(invoice_id, full_name);

const get_full_name = async (invoice_id, is_mine) => {
  try {
    const sql_select = `SELECT ${is_mine ? 'own_full_name' : 'recipient_full_name'} FROM invoice WHERE id = ?`;        
    return await init_db_operation(sql_select, invoice_id);
  } catch (err) {
    console.log('get_full_name', err);
  }  
};

exports.get_own_full_name = async invoice_id => await get_full_name(invoice_id, true);

exports.get_recipient_full_name = async invoice_id => await get_full_name(invoice_id);

exports.get_all_full_names = async user_id => {
  try {
    const sql_select_name = `SELECT DISTINCT own_full_name, recipient_full_name FROM invoice WHERE user_id = ?`;  
    return await init_db_operation(sql_select_name, user_id, true);    
  } catch (err) {
    console.log('get_all_full_names', err)
  }
}
exports.is_recipient = async (invoice_id, is_recipient) => {
  try {
    const sql_update = `UPDATE \`invoice\` SET is_recipient = ? WHERE id = ?`;        
    return await init_db_operation(sql_update, [is_recipient, invoice_id]);
  } catch (err) {
    console.log('is_recipient', err);
  }  
};

exports.get_info_is_recipient = async invoice_id => {
  try {
    const sql_select = `SELECT is_recipient FROM invoice WHERE id = ?`;        
    return await init_db_operation(sql_select, invoice_id);
  } catch (err) {
    console.log('get_info_is_recipient', err);
  }  
};

exports.set_locality = async (invoice_id, locality) => {
  try {
    const sql_update = `UPDATE \`invoice\` SET locality = ? WHERE id = ?`;        
    return await init_db_operation(sql_update, [locality, invoice_id]);
  } catch (err) {
    console.log('set_locality', err);
  }  
};

exports.get_locality = async invoice_id => {
  try {
    const sql_select = `SELECT locality FROM invoice WHERE id = ?`;        
    return await init_db_operation(sql_select, invoice_id);
  } catch (err) {
    console.log('get_locality', err);
  }  
};

const get_all_locality = async () => {
  try {
    const sql_select = `SELECT locality, count(*) as users_count FROM invoice GROUP BY locality`;        
    return await init_db_operation(sql_select, null, true);
  } catch (err) {
    console.log('get_all_locality', err);
  }
};

exports.set_type_delivery = async (invoice_id, type_delivery) => {
  try {
    const sql_update = `UPDATE \`invoice\` SET type_delivery = ? WHERE id = ?`;        
    return await init_db_operation(sql_update, [type_delivery, invoice_id]);
  } catch (err) {
    console.log('set_type_delivery', err);
  }  
};

exports.get_address_number_department = async invoice_id => {
  try {
    const sql_select = `SELECT address_number_department FROM invoice WHERE id = ?`;        
    return await init_db_operation(sql_select, invoice_id);
  } catch (err) {
    console.log('get_address_number_department', err);
  }  
};

exports.set_address_number_department = async (invoice_id, address_number_department) => {
  try {
    const sql_update = `UPDATE \`invoice\` SET address_number_department = ? WHERE id = ?`;        
    return await init_db_operation(sql_update, [address_number_department, invoice_id]);
  } catch (err) {
    console.log('set_address_number_department', err);
  }  
};

exports.get_type_delivery = async invoice_id => {
  try {
    const sql_select = `SELECT type_delivery FROM invoice WHERE id = ?`;        
    return await init_db_operation(sql_select, invoice_id);
  } catch (err) {
    console.log('get_type_delivery', err);
  }  
};

exports.set_type_payment = async (invoice_id, type_payment) => {
  try {
    const sql_update = `UPDATE \`invoice\` SET type_payment = ? WHERE id = ?`;        
    return await init_db_operation(sql_update, [type_payment, invoice_id]);
  } catch (err) {
    console.log('set_type_payment', err);
  }  
};

exports.get_type_payment = async invoice_id => {
  try {
    const sql_select = `SELECT type_payment FROM invoice WHERE id = ?`;        
    return await init_db_operation(sql_select, invoice_id);
  } catch (err) {
    console.log('get_type_payment', err);
  }  
};

exports.set_confirm = async (invoice_id, confirm) => {
  try {
    const sql_update = `UPDATE \`invoice\` SET require_confirm = ? WHERE id = ?`;        
    return await init_db_operation(sql_update, [confirm, invoice_id]);
  } catch (err) {
    console.log('set_confirm', err);
  }  
};

exports.get_confirm = async invoice_id => {
  try {
    const sql_select = `SELECT require_confirm FROM invoice WHERE id = ?`;        
    return await init_db_operation(sql_select, invoice_id);
  } catch (err) {
    console.log('get_confirm', err);
  }  
};

exports.set_correct = async (invoice_id, correct) => {
  try {
    const sql_update = `UPDATE \`invoice\` SET is_correct = ? WHERE id = ?`;        
    return await init_db_operation(sql_update, [correct, invoice_id]);
  } catch (err) {
    console.log('set_correct', err);
  }  
};

exports.is_correct = async invoice_id => {
  try {
    const sql_select = `SELECT is_correct FROM invoice WHERE id = ?`;        
    return await init_db_operation(sql_select, invoice_id);
  } catch (err) {
    console.log('is_correct', err);
  }  
};


exports.get_sum = async invoice_id => {
  try {
    const sql_select = `SELECT sum FROM invoice WHERE id = ?`;        
    return await init_db_operation(sql_select, invoice_id);
  } catch (err) {
    console.log('get_sum', err);
  }  
};

exports.set_sum = async (invoice_id, sum) => {
  try {
    const sql_update = `UPDATE \`invoice\` SET sum = ? WHERE id = ?`;      
    return await init_db_operation(sql_update, [+sum, invoice_id]);
  } catch (err) {
    console.log('set_sum', err);
  }  
};

exports.get_current_invoice_date = async invoice_id => {
  try {
    const sql_select = `SELECT date FROM invoice WHERE id = ?`;        
    return await init_db_operation(sql_select, invoice_id);
  } catch (err) {
    console.log('get_current_invoice_date', err);
  }  
};

exports.set_current_invoice_date = async (invoice_id, date = new Date().toLocaleString({timeZone: 'Europe/Kiev'})) => {
  try {
    const sql_update = `UPDATE \`invoice\` SET date = ? WHERE id = ?`;      
    return await init_db_operation(sql_update, [date, invoice_id]);
  } catch (err) {
    console.log('set_current_invoice_date', err);
  }  
};

const parse_goods_ids = data => data?.split(', ').map(element => {
  const info_array = element.split('$');
  return {
    ms_goods_id: info_array[0], 
    quantity: parseInt(info_array[1])
  };
});

exports.get_invoice_goods_id = async invoice_id => {
  try {
    const sql_select = `SELECT goods_id FROM invoice WHERE id = ?`;        
    const {goods_id} = await init_db_operation(sql_select, invoice_id);   
    console.log(goods_id) 
    return parse_goods_ids(goods_id);
  } catch (err) {
    console.log('get_invoice_goods_id', err);
  }  
};

exports.set_invoice_goods_id  = async (invoice_id, goods_id) => {
  try {
    const sql_update = `UPDATE \`invoice\` SET goods_id = ? WHERE id = ?`;      
    return await init_db_operation(sql_update, [goods_id, invoice_id]);
  } catch (err) {
    console.log('set_invoice_goods_id', err);
  }  
};

exports.get_true_recipient_full_name  = async invoice_id => {
  try {
    const sql_update = `SELECT own_full_name, is_recipient, recipient_full_name FROM invoice WHERE id = ?`;     
    return await init_db_operation(sql_update, invoice_id);
  } catch (err) {
    console.log('get_true_recipient_full_name', err);
  }  
};

exports.get_true_recipient_contact = async invoice_id => {
  try {
    const sql_update = `SELECT own_contact, is_recipient, recipient_contact FROM invoice WHERE id = ?`;     
    return await init_db_operation(sql_update, invoice_id);
  } catch (err) {
    console.log('get_true_recipient_contact', err);
  }  
}

exports.set_consignment_note = async (invoice_id, consignment_note) => {
  try {
    const sql_update = `UPDATE \`invoice\` SET consignment_note = ? WHERE id = ?`;      
    return await init_db_operation(sql_update, [consignment_note, invoice_id]);
  } catch (err) {
    console.log('set_consignment_note', err);
  }  
};


exports.get_consignment_note = async invoice_id => {
  try {
    const sql_select = `SELECT consignment_note FROM invoice WHERE id = ?`;        
    return await init_db_operation(sql_select, invoice_id);
  } catch (err) {
    console.log('get_consignment_note', err);
  }  
};

exports.get_data_from_invoice = async user_id => {
  try {
    const sql_select = `SELECT id,
      own_full_name, 
      own_contact, 
      locality, 
      address_number_department, 
      type_delivery,
      type_payment, 
      require_confirm,
      is_recipient,
      recipient_contact,
      recipient_full_name,
      counterparty_id FROM invoice WHERE user_id = ?`;        
    return await init_db_operation(sql_select, user_id, true);
  } catch (err) {
    console.log('get_consignment_note', err);
  } 
};

exports.delete_data_from_invoice = async invoice_id => {
  try {    
    const sql_clear = `UPDATE \`invoice\` SET 
      own_contact = NULL, 
      locality = NULL, 
      address_number_department = NULL, 
      type_delivery = NULL, 
      require_confirm = NULL, 
      type_payment = NULL
      WHERE id = ?`;     
    return await init_db_operation(sql_clear, invoice_id);
  } catch (err) {
    console.log('delete_data_from_invoice', err);
  } 
};

exports.set_template_data = async (data, invoice_id) => {
  try {
    const prepare_update_sql_chunk = Object.entries(data).map(([key, value]) => `${key} = '${value}'`).join(', ');
    const sql_update = `UPDATE invoice SET ${prepare_update_sql_chunk} WHERE id = ?`;
    return await init_db_operation(sql_update, invoice_id);
  } catch (err) {
    console.log('get_consignment_note', err);
  } 
};

exports.set_counterparty = async (invoice_id, counterparty_id) => {
  try {
    const sql_update = `UPDATE \`invoice\` SET counterparty_id = ? WHERE id = ? `;        
    return await init_db_operation(sql_update, [counterparty_id, invoice_id]);
  } catch (err) {
    console.log('set_counterparty', err);
  }  
};

exports.get_counterparty = async invoice_id => {
  try {
    const sql_update = `SELECT counterparty_id FROM invoice WHERE id = ? `;        
    return await init_db_operation(sql_update, invoice_id);
  } catch (err) {
    console.log('get_counterparty', err);
  }  
};

exports.set_counterparty_contact = async (invoice_id, counterparty_contact_id) => {
  try {
    const sql_update = `UPDATE \`invoice\` SET counterparty_contact_id = ? WHERE id = ? `;        
    return await init_db_operation(sql_update, [counterparty_contact_id, invoice_id]);
  } catch (err) {
    console.log('set_counterparty_contact', err);
  }  
};

exports.get_counterparty_contact = async invoice_id => {
  try {
    const sql_update = `SELECT counterparty_contact_id FROM invoice WHERE id = ? `;        
    return await init_db_operation(sql_update, invoice_id);
  } catch (err) {
    console.log('get_counterparty_contact', err);
  }  
};

exports.set_invoice_ms_id = async (invoice_id, invoice_ms_id) => {
  try {
    const sql_update = `UPDATE \`invoice\` SET invoice_ms_id = ? WHERE id = ? `;        
    return await init_db_operation(sql_update, [invoice_ms_id, invoice_id]);
  } catch (err) {
    console.log('set_invoice_ms_id', err);
  }  
};

exports.get_invoice_ms_id = async invoice_id => {
  try {
    const sql_update = `SELECT invoice_ms_id FROM invoice WHERE id = ? `;        
    return await init_db_operation(sql_update, invoice_id);
  } catch (err) {
    console.log('get_invoice_ms_id', err);
  }  
};

exports.set_invoice_status = async (invoice_id, invoice_status) => {
  try {
    const sql_update = `UPDATE \`invoice\` SET status = ? WHERE id = ? `;        
    return await init_db_operation(sql_update, [invoice_status, invoice_id]);
  } catch (err) {
    console.log('set_invoice_status', err);
  }  
};

exports.get_invoice_status = async invoice_id => {
  try {
    const sql_update = `SELECT status FROM invoice WHERE id = ? `;        
    return await init_db_operation(sql_update, invoice_id);
  } catch (err) {
    console.log('get_invoice_status', err);
  }  
};

exports.select_all_invoices_by_user = async user_id => {
  try {
    const sql_update = `SELECT user_id, id, goods_id, date, sum, status FROM invoice WHERE user_id = ? `;        
    return await init_db_operation(sql_update, user_id, true);
  } catch (err) {
    console.log('select_all_invoices_by_user', err);
  } 
};

exports.count_users_in_areas = async () => {
  try {
    const areas = await get_company_areas();
    const localities = await get_all_locality();
    const statistics_area = {};
    areas.forEach(area => {
      localities.forEach(({locality, users_count}) => {
        if (locality && locality.includes(area)) {
          if (locality.includes('м. Київ')) area = 'Київ';
          if (statistics_area[area]) {
            statistics_area[area] += users_count;
          } else {
            statistics_area[area] = users_count;
          }
        }
      });
    });
    return statistics_area;
  } catch (err) {
    console.log('count_users_in_areas', err);
  }
};
