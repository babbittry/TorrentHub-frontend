const path = require('path')

module.exports = {
  i18n: {
    defaultLocale: 'zh',
    locales: ['en', 'zh', 'ja', 'fr'],
    localeDetection: false,
  },
  localePath: path.resolve('./public/locales'),
}
