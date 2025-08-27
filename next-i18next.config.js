const path = require('path')

module.exports = {
  i18n: {
    defaultLocale: 'zh-CN',
    locales: ['en', 'zh-CN', 'ja', 'fr'],
    localeDetection: false,
  },
  localePath: path.resolve('./public/locales'),
}
