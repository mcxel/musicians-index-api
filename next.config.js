const path = require('path');

module.exports = {
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'tmi-platform/apps/web/src');
    return config;
  }
};
