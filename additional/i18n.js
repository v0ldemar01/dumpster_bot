'use strict';
const I18n = require("telegraf-i18n");
const path = require("path");

const locales_path =
  global.os == 'win32'
    ? __dirname.split('\\').slice(0, -1).join('\\')
    : __dirname.split('/').slice(0, -1).join('/');

module.exports = new I18n({
  directory: path.resolve(locales_path, 'locales'),
  defaultLanguage: 'ua',
  allowMissing: true,
  sessionName: 'session',
  useSession: true,
});
