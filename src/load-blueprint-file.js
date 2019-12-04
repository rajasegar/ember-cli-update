'use strict';

const fs = require('fs-extra');
const getBlueprintFilePath = require('./get-blueprint-file-path');

/**
 * Load the blue print file from the current working directory.
 *
 * @function loadBlueprintFile
 * @param {string} cwd
 * @returns {Promise<json>} json content
 */
async function loadBlueprintFile(cwd) {
  try {
    return await fs.readJson(await getBlueprintFilePath(cwd));
  } catch (err) {}
}

module.exports = loadBlueprintFile;
