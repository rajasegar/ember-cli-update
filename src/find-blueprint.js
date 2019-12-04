'use strict';

/**
 * Check whether the given blueprint is existing in the
 * generated list of blueprints and return the same.
 *
 * @param {object} emberCliUpdateJson
 * @param {string} packageName
 * @param {string} blueprintName
 * @returns {object}
 */
function findBlueprint(emberCliUpdateJson, packageName, blueprintName) {
  let blueprint = emberCliUpdateJson.blueprints.find(b => {
    return b.packageName === packageName && b.name === blueprintName;
  });

  return blueprint;
}

module.exports = findBlueprint;
