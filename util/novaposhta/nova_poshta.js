'use strict';
const path =
  global.os == 'win32'
    ? __dirname.split('\\').slice(0, -2).join('\\')
    : __dirname.split('/').slice(0, -1).join('/');
require('dotenv').config({ path: path + '/.env' });
const { API_NOVA_POSHTA_KEY, SENDER_NUMBER } = process.env;
const NovaPoshta = require('novaposhta');
const api = new NovaPoshta({ apiKey: API_NOVA_POSHTA_KEY });
const fs_simple = require('fs');
const fs = fs_simple.promises;

const axios = require('axios');

const get_local_company_localities = async (filter) => {
  try {
    const only_city = filter ? filter[0].split(' ')[1] : null;
    const type_filter = filter ? filter[1].split(' ')[0] : null;
    const { data } = filter
      ? await api.address.getCities({ FindByString: only_city })
      : await api.address.getCities();
    return filter
      ? data.filter(({ AreaDescription }) =>
          AreaDescription.includes(type_filter)
        )[0]?.Ref
      : data.map(
          ({
            SettlementTypeDescription,
            Description,
            AreaDescription,
            Ref,
          }) => [
            `${SettlementTypeDescription[0]}. ${
              Description.split(' ')[0]
            }, ${AreaDescription} область`,
            Ref,
          ]
        );
  } catch (err) {
    console.log('get_local_company_localities', err);
  }
};

exports.get_company_areas = async () => {
  try {
    const { data } = await api.address.getAreas();
    return data.map(({ Description }) => `${Description} область`);
  } catch (err) {
    console.log('get_company_areas', err);
  }
};

exports.get_company_localities = async (filter) =>
  get_local_company_localities(filter);

exports.get_company_ware_houses_by_filter = async (ref, filter) =>
  await local_get_company_ware_houses_by_filter(ref, filter);

const local_get_company_ware_houses_by_filter = async (
  ref,
  filter,
  is_return_ref
) => {
  try {
    const { data } = await api.address.getWarehouses({ CityRef: ref });
    return is_return_ref
      ? data.filter(({ Number }) => Number == filter)[0]?.Ref
      : data
          .filter(({ Number }) => Number == filter)
          .map(({ Description, DescriptionRu }) => ({
            Description,
            DescriptionRu,
          }));
  } catch (err) {
    console.log('local_get_company_ware_houses_by_filter', err);
  }
};

const init_data_consignment_note = async () => {
  let result;
  try {
    result = await api.common.getTypesOfPayers();
    const PayerTypes = result.success ? result?.data : null;

    result = await api.common.getPaymentForms();
    const PaymentForms = result.success ? result?.data : null;

    result = await api.common.getCargoTypes();
    const CargoTypes = result.success ? result?.data : null;

    result = await api.common.getServiceTypes();
    const ServiceTypes = result.success ? result?.data : null;
  } catch (err) {
    console.log('init_data_consignment_note', err);
  }
};

const get_sender_ref = async () => {
  try {
    const CounterpartyRes = await api.counterparty.getCounterparties({
      CounterpartyProperty: 'Sender',
    });
    return CounterpartyRes?.data[0].Ref;
  } catch (err) {
    console.log('get_sender_ref', err);
  }
};

const get_recipient_ref = async (LastName, FirstName, MiddleName, Phone) => {
  try {
    const CounterpartyCreate = await api.counterparty.save({
      LastName,
      FirstName,
      MiddleName: MiddleName ? MiddleName : '',
      Phone,
      Email: '',
      CounterpartyType: 'PrivatePerson',
      CounterpartyProperty: 'Recipient',
    });
    return [
      CounterpartyCreate?.data[0]?.Ref,
      CounterpartyCreate?.data[0]?.ContactPerson?.data[0]?.Ref,
    ];
  } catch (err) {
    console.log('get_recipient_ref', err);
  }
};

const get_contacts_ref = async (SenderRef) => {
  try {
    const CounterpartyContactPersons = await api.counterparty.getCounterpartyContactPersons(
      { Ref: SenderRef }
    );
    return CounterpartyContactPersons?.data[0].Ref;
  } catch (err) {
    console.log('get_contacts_ref', SenderRef, err);
  }
};

const get_street_ref = async (CityRef, filter = 'Київська') => {
  try {
    const StreetRef = await await api.address.getStreet({
      CityRef,
      FindByString: filter,
    });
    return StreetRef?.data[0]?.Ref;
  } catch (err) {
    console.log('get_street_ref', err);
  }
};

const create_contacts_ref = async (...data) => {
  try {
    const [RecipientRef, LastName, FirstName, MiddleName, Phone] = data;
    const CounterpartyContactPersons = await api.contactPerson.save({
      CounterpartyRef: RecipientRef,
      FirstName,
      LastName,
      MiddleName: MiddleName ? MiddleName : '',
      Phone,
    });
    return CounterpartyContactPersons?.data[0].Ref;
  } catch (err) {
    console.log('create_contacts_ref', err);
  }
};

const update_counterparty = async (...data) => {
  try {
    const [CityRef, Ref, LastName, FirstName, MiddleName, Phone] = data;
    console.log(data);
    const CounterpartyUpdate = await api.counterparty.update({
      CityRef,
      Ref,
      FirstName,
      MiddleName: MiddleName ? MiddleName : '',
      LastName,
      Phone,
      CounterpartyType: 'PrivatePerson',
      CounterpartyProperty: 'Recipient',
    });
    console.log(CounterpartyUpdate?.data[0].Ref);
    return CounterpartyUpdate?.data[0].Ref;
  } catch (err) {
    console.log('update_counterparty', err);
  }
};

const create_recipient_address = async (...data) => {
  try {
    const [CounterpartyRef, StreetRef, BuildingNumber, Flat, Note] = data;
    const AddressRecipient = await api.address.save({
      CounterpartyRef,
      StreetRef,
      BuildingNumber,
      Flat: Flat ? Flat : '',
      Note: Note ? Note : '',
    });
    return AddressRecipient?.data[0]?.Ref;
  } catch (err) {
    console.log('create_recipient_address', err);
  }
};

exports.get_consignment_note = async (
  full_name,
  phone_number,
  city_recipient,
  address_recipient,
  date
) => {
  try {
    const CITY_SENDER_ADDRESS = 'м. Львів, Львівська область, Відділення №1';
    if (!date)
      date = `${new Date().getDate() + 5}.${
        new Date().getMonth() + 1
      }.${new Date().getFullYear()}`;
    const SenderRef = await get_sender_ref();

    const [LastName, FirstName, MiddleName] = full_name.split(' ');

    const [RecipientRef, ContactRecipientrRef] = await get_recipient_ref(
      LastName,
      FirstName,
      MiddleName,
      phone_number
    );

    const ContactSenderRef = await get_contacts_ref(SenderRef);

    const city = CITY_SENDER_ADDRESS.split(',');
    const department = CITY_SENDER_ADDRESS.split(',')[1]
      .split(' ')
      .pop()
      .replace('№', '');

    const CitySenderRef = await get_local_company_localities(city);
    const CityRecipientRef = await get_local_company_localities(
      city_recipient.split(', ')
    );

    await update_counterparty(
      CityRecipientRef,
      RecipientRef,
      LastName,
      FirstName,
      MiddleName,
      phone_number
    );

    const AddressSenderRef = await local_get_company_ware_houses_by_filter(
      CitySenderRef,
      department,
      true
    );
    let AddressRecipientRef;
    let StreetRef;
    if (!isNaN(parseInt(address_recipient))) {
      AddressRecipientRef = await local_get_company_ware_houses_by_filter(
        CityRecipientRef,
        address_recipient,
        true
      );
    } else {
      const filter = address_recipient.split(', ')[0].split(' ')[1];
      StreetRef = await get_street_ref(CityRecipientRef, filter);
      const build_number = address_recipient.split(', ')[1].split(' ')[0];
      const flat = address_recipient.split(', ')[2]?.split(' ')[1];
      AddressRecipientRef = await create_recipient_address(
        RecipientRef,
        StreetRef,
        build_number,
        flat
      );
    }

    const ConsignmentNoteCreate = await api.internetDocument.save({
      NewAddress: '1',
      PayerType: 'Recipient',
      PaymentMethod: 'Cash',
      CargoType: 'Cargo',
      VolumeGeneral: 0.001, //
      Weight: 1, //
      ServiceType: 'WarehouseWarehouse',
      SeatsAmount: '1',
      Description: 'товар Dumpster',
      Cost: '300', //
      CitySender: CitySenderRef,
      Sender: SenderRef,
      SenderAddress: AddressSenderRef,
      ContactSender: ContactSenderRef,
      SendersPhone: SENDER_NUMBER,
      RecipientCity: CityRecipientRef,
      RecipientCityName: city_recipient.split(', ')[0].split(' ')[1],
      Recipient: RecipientRef,
      RecipientAddress: AddressRecipientRef,
      ContactRecipient: ContactRecipientrRef,
      RecipientsPhone: phone_number,
      DateTime: date,
    });
    return ConsignmentNoteCreate?.data[0]?.IntDocNumber;
  } catch (err) {
    console.log('get_consignment_note', err);
  }
};

exports.print_consignment_note = async (IntDocNumber, user_id, ms_goods_id) => {
  try {
    const { data } = await axios(
      `https://my.novaposhta.ua/orders/printDocument/orders[]/${IntDocNumber}/type/pdf/apiKey/${API_NOVA_POSHTA_KEY}`,
      {
        method: 'GET',
        responseType: 'stream',
      }
    );

    const dir = path + `/${user_id}/`;
    await createDir(dir);
    const path_name = dir + `Штрих-код ТТН замовлення_№${ms_goods_id}.pdf`;
    await data.pipe(fs_simple.createWriteStream(path_name, 'utf-8'));
    return path_name;
  } catch (err) {
    console.log('print_consignment_note', err);
  }
};

const createDir = async (dir) => {
  try {
    await fs.access(dir, fs_simple.constants.F_OK | fs_simple.constants.W_OK);
  } catch (err) {
    if (err.code === 'ENOENT') await fs.mkdir(dir);
  }
};

exports.delete_consignment_note_file = async (user_id, ms_goods_id) => {
  try {
    const dir = path + `/${user_id}/`;
    const path_name = dir + `Штрих-код ТТН замовлення_№${ms_goods_id}.pdf`;
    await fs.unlink(path_name);
    await fs.rmdir(dir);
  } catch (err) {
    console.log('delete_consignment_note', err);
  }
};
