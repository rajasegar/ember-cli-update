'use strict';

module.exports.run = require('./run');
module.exports.npx = require('boilerplate-update/src/npx');
module.exports.getVersions = require('boilerplate-update/src/get-versions');

module.exports.spawn = async function spawn() {
  let ps = require('child_process').spawn(...arguments);

  await new Promise((resolve, reject) => {
    ps.on('error', reject);
    ps.on('exit', resolve);
  });
};
