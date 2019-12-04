'use strict';

/**
 * Returns an object with options array set
 * including the given blueprint.
 *
 * @param blueprint
 * @returns {object}
 */
function loadSafeBlueprint(blueprint) {
  return {
    options: [],
    ...blueprint
  };
}

module.exports = loadSafeBlueprint;
