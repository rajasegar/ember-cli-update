'use strict';

const fs = require('fs-extra');
const path = require('path');

/**
 * Get the blueprint file path from current working directory.<br/>
 * For apps, it will be from `my-app/config/ember-cli-update.json` <br/>
 * For addons, first read the config path from package.json `ember-addon.configPath`
 * and then construct.<br/>  So for addons, it will be
 * from `my-addon/tests/dummy/confg/ember-cli-update.json`<br/><br/>
 * <b>Schema for ember-cli-update.json</b>
 * ```js
 * {
 *   schemaVersion: 0,
 *   blueprints:[{
 *     packageName: '',
 *     location: '',
 *     version: ''
 *   }]
 * }
 * ```
 *
 * @param {string} cwd
 * @returns {string} Full path for ember-cli-update.json
 */
async function getBlueprintFilePath(cwd) {
  let configDir = 'config';

  try {
    let packageJson = await fs.readJson(path.join(cwd, 'package.json'));

    if (packageJson['ember-addon'] && packageJson['ember-addon'].configPath) {
      configDir = packageJson['ember-addon'].configPath;
    }
  } catch (err) {}

  return path.join(cwd, configDir, 'ember-cli-update.json');
}

module.exports = getBlueprintFilePath;
